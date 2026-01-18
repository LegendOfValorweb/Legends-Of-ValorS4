import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Account, Item, InventoryItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const HEARTBEAT_INTERVAL = 60000;

interface GameState {
  account: Account | null;
  inventory: InventoryItem[];
  isLoading: boolean;
  setAccount: (account: Account | null) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  addToInventory: (item: Item) => Promise<boolean>;
  spendGold: (amount: number) => boolean;
  addGold: (amount: number) => void;
  logout: () => void;
  login: (username: string, password: string, role: "player" | "admin") => Promise<{ account: Account | null; error?: string }>;
  refreshInventory: () => Promise<void>;
}

const GameContext = createContext<GameState | null>(null);

const SESSION_KEY = "legend_of_valor_session";

export function GameProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<Account | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const accountIdRef = useRef<string | null>(null);

  // Keep ref in sync with account state
  useEffect(() => {
    accountIdRef.current = account?.id ?? null;
  }, [account]);

  // Restore session on page load
  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (!savedSession) {
        setIsLoading(false);
        return;
      }

      try {
        const { accountId } = JSON.parse(savedSession);
        if (!accountId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/accounts/${accountId}`);
        if (response.ok) {
          const acc = await response.json();
          setAccountState(acc);
          
          if (acc.role === "player") {
            const invResponse = await fetch(`/api/accounts/${acc.id}/inventory`);
            if (invResponse.ok) {
              const inv = await invResponse.json();
              setInventory(inv);
            }
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setAccount = useCallback((acc: Account | null) => {
    setAccountState(acc);
    if (acc) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId: acc.id }));
    }
    if (!acc) setInventory([]);
  }, []);

  const login = useCallback(async (username: string, password: string, role: "player" | "admin"): Promise<{ account: Account | null; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { account: null, error: errorData.error || "Login failed" };
      }
      
      const acc = await response.json();
      setAccountState(acc);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ accountId: acc.id }));
      
      if (acc && role === "player") {
        const invResponse = await fetch(`/api/accounts/${acc.id}/inventory`);
        const inv = await invResponse.json();
        setInventory(inv);
      }
      
      return { account: acc };
    } catch (error) {
      console.error("Login failed:", error);
      return { account: null, error: "Connection error" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    if (!account) return;
    try {
      const response = await fetch(`/api/accounts/${account.id}/inventory`);
      const inv = await response.json();
      setInventory(inv);
    } catch (error) {
      console.error("Failed to refresh inventory:", error);
    }
  }, [account]);

  const refreshAccount = useCallback(async () => {
    const currentAccountId = accountIdRef.current;
    if (!currentAccountId) return;
    try {
      const response = await fetch(`/api/accounts/${currentAccountId}`);
      if (response.ok) {
        const updatedAccount = await response.json();
        setAccountState(updatedAccount);
      }
    } catch (error) {
      console.error("Failed to refresh account:", error);
    }
  }, []);

  const spendGold = useCallback((amount: number): boolean => {
    if (!account || account.gold < amount) return false;
    const newGold = account.gold - amount;
    setAccountState((prev) => prev ? { ...prev, gold: newGold } : null);
    
    apiRequest("PATCH", `/api/accounts/${account.id}/gold`, { gold: newGold })
      .catch(console.error);
    
    return true;
  }, [account]);

  const addGold = useCallback((amount: number) => {
    if (!account) return;
    const newGold = account.gold + amount;
    setAccountState((prev) => prev ? { ...prev, gold: newGold } : null);
    
    apiRequest("PATCH", `/api/accounts/${account.id}/gold`, { gold: newGold })
      .catch(console.error);
  }, [account]);

  const addToInventory = useCallback(async (item: Item): Promise<boolean> => {
    if (!account) return false;
    if (account.gold < item.price) return false;
    
    const newGold = account.gold - item.price;
    setAccountState((prev) => prev ? { ...prev, gold: newGold } : null);

    try {
      const [, invResponse] = await Promise.all([
        apiRequest("PATCH", `/api/accounts/${account.id}/gold`, { gold: newGold }),
        apiRequest("POST", `/api/accounts/${account.id}/inventory`, { itemId: item.id }),
      ]);
      
      const newItem = await invResponse.json();
      setInventory((prev) => [...prev, newItem]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account.id, "inventory"] });
      
      return true;
    } catch (error) {
      console.error("Failed to add to inventory:", error);
      setAccountState((prev) => prev ? { ...prev, gold: prev.gold + item.price } : null);
      return false;
    }
  }, [account]);

  const logout = useCallback(async () => {
    if (account) {
      try {
        await fetch(`/api/accounts/${account.id}/logout`, { method: "POST" });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setAccountState(null);
    setInventory([]);
  }, [account]);

  useEffect(() => {
    if (!account) return;
    
    const sendHeartbeat = async () => {
      try {
        await fetch(`/api/accounts/${account.id}/heartbeat`, { method: "POST" });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    };
    
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [account]);

  useEffect(() => {
    if (!account || account.role !== "player") return;
    
    const eventSource = new EventSource(`/api/player/events?playerId=${account.id}`);
    
    eventSource.addEventListener("mandatoryEventRegistration", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: "Mandatory Event Registration",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/events"] });
        queryClient.invalidateQueries({ queryKey: ["/api/accounts", account.id, "events"] });
      } catch (error) {
        console.error("Failed to parse event data:", error);
      }
    });

    eventSource.addEventListener("newChallenge", (event) => {
      try {
        const data = JSON.parse(event.data);
        const challengerName = data.challengerName || "A player";
        toast({
          title: "New Challenge!",
          description: `${challengerName} has sent you a challenge! Do you accept?`,
          duration: 10000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
      } catch (error) {
        console.error("Failed to parse challenge data:", error);
      }
    });

    eventSource.addEventListener("challengeAccepted", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: "Challenge Accepted!",
          description: data.message,
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
      } catch (error) {
        console.error("Failed to parse challenge data:", error);
      }
    });

    eventSource.addEventListener("challengeDeclined", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: "Challenge Declined",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
      } catch (error) {
        console.error("Failed to parse challenge data:", error);
      }
    });

    eventSource.addEventListener("challengeResult", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: data.result === "won" ? "Victory!" : "Defeat",
          description: data.message,
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
        refreshAccount();
      } catch (error) {
        console.error("Failed to parse challenge result:", error);
      }
    });

    eventSource.addEventListener("auction_ended", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.winnerId === account.id) {
          toast({
            title: "Auction Won!",
            description: `You won the auction! The skill has been added to your collection.`,
            duration: 8000,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["/api/accounts", account.id, "skills"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
        refreshAccount();
      } catch (error) {
        console.error("Failed to parse auction_ended data:", error);
      }
    });

    eventSource.addEventListener("auction_bid", (event) => {
      try {
        queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
      } catch (error) {
        console.error("Failed to parse auction_bid data:", error);
      }
    });

    eventSource.addEventListener("auction_started", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: "New Auction Started!",
          description: "A new skill auction has begun!",
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
      } catch (error) {
        console.error("Failed to parse auction_started data:", error);
      }
    });

    eventSource.addEventListener("guildBattleComplete", (event) => {
      try {
        const data = JSON.parse(event.data);
        toast({
          title: "Guild Battle Complete!",
          description: data.winnerName ? `${data.winnerName} won the battle!` : "The battle ended in a tie!",
          duration: 5000,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboards/guild_wins"] });
        queryClient.invalidateQueries({ queryKey: ["/api/guilds"] });
      } catch (error) {
        console.error("Failed to parse guildBattleComplete data:", error);
      }
    });
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [account, toast]);

  return (
    <GameContext.Provider
      value={{
        account,
        inventory,
        isLoading,
        setAccount,
        setInventory,
        addToInventory,
        spendGold,
        addGold,
        logout,
        login,
        refreshInventory,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
