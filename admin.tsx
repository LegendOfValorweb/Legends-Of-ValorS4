import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Item, ItemTier, ItemType, Account, PlayerRank, Event, Challenge, Pet, PetTier, PetElement, PetStats } from "@shared/schema";
import { petTiers, petElements } from "@shared/schema";
import { ALL_ITEMS, TIER_LABELS, getItemById } from "@/lib/items-data";
import { playerRanks } from "@shared/schema";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, Crown, LogOut, Gift, Sword, Shield, Gem, Coins, Users, Edit, Trophy, Zap, Brain, Target, Clover, Trash2, Calendar, Plus, AlertTriangle, Swords, Check, Cat, Castle, Gavel, Clock, Play, Pause, Sparkles } from "lucide-react";
import { ALL_SKILLS, getSkillById, type SkillDefinition } from "@shared/skills-data";
import type { SkillAuction } from "@shared/schema";
import { TierFilter } from "@/components/tier-filter";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

const tierBadgeStyles: Record<ItemTier, string> = {
  normal: "bg-tier-normal/20 text-tier-normal border-tier-normal/30",
  super_rare: "bg-tier-super-rare/20 text-tier-super-rare border-tier-super-rare/30",
  x_tier: "bg-tier-x/20 text-tier-x border-tier-x/30",
  umr: "bg-tier-umr/20 text-tier-umr border-tier-umr/30",
  ssumr: "bg-tier-ssumr/20 text-tier-ssumr border-tier-ssumr/30",
  divine: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  journeyman: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  expert: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  master: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  grandmaster: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  legend: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  elite: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

function ItemTypeIcon({ type }: { type: ItemType }) {
  switch (type) {
    case "weapon":
      return <Sword className="w-4 h-4 text-stat-str" />;
    case "armor":
      return <Shield className="w-4 h-4 text-stat-int" />;
    case "accessory":
      return <Gem className="w-4 h-4 text-stat-luck" />;
  }
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-300 border-gray-500",
  uncommon: "bg-green-500/20 text-green-300 border-green-500",
  rare: "bg-blue-500/20 text-blue-300 border-blue-500",
  epic: "bg-purple-500/20 text-purple-300 border-purple-500",
  legendary: "bg-amber-500/20 text-amber-300 border-amber-500",
  mythic: "bg-pink-500/20 text-pink-300 border-pink-500",
};

function SkillAuctionManagement({ account, toast }: { account: Account; toast: any }) {
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const { data: activeAuctionData } = useQuery<{
    auction: SkillAuction | null;
    bids: any[];
    highestBid: any | null;
  }>({
    queryKey: ["/api/auctions/active"],
    refetchInterval: 5000,
  });

  const { data: queuedAuctions = [] } = useQuery<SkillAuction[]>({
    queryKey: ["/api/auctions/queue"],
    refetchInterval: 10000,
  });

  const filteredSkills = useMemo(() => {
    if (!skillSearch) return ALL_SKILLS.slice(0, 20);
    return ALL_SKILLS.filter(s => 
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      s.rarity.toLowerCase().includes(skillSearch.toLowerCase())
    ).slice(0, 20);
  }, [skillSearch]);

  const addToQueue = async () => {
    if (!selectedSkillId) {
      toast({ title: "Select a skill first", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", `/api/admin/auctions/queue?adminId=${account.id}`, {
        skillId: selectedSkillId,
      });
      toast({ title: "Skill added to queue!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/queue"] });
      setSelectedSkillId("");
    } catch (error) {
      toast({ title: "Failed to add skill", variant: "destructive" });
    }
  };

  const startNextAuction = async () => {
    try {
      await apiRequest("POST", `/api/admin/auctions/start-next?adminId=${account.id}`);
      toast({ title: "Auction started!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/queue"] });
    } catch (error: any) {
      toast({ title: "Failed to start auction", description: error.message, variant: "destructive" });
    }
  };

  const finalizeAuction = async () => {
    try {
      await apiRequest("POST", `/api/admin/auctions/finalize?adminId=${account.id}`);
      toast({ title: "Auction finalized!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/queue"] });
    } catch (error) {
      toast({ title: "Failed to finalize auction", variant: "destructive" });
    }
  };

  const removeFromQueue = async (auctionId: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/auctions/${auctionId}?adminId=${account.id}`);
      toast({ title: "Removed from queue" });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/queue"] });
    } catch (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  const activeSkill = activeAuctionData?.auction 
    ? getSkillById(activeAuctionData.auction.skillId) 
    : null;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-serif text-lg font-semibold mb-4">Skill Auction Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Manage the skill auction queue. Only one auction can be active at a time. 8-hour bidding cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Current Auction
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAuctionData?.auction && activeSkill ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{activeSkill.name}</span>
                    <Badge className={rarityColors[activeSkill.rarity]}>
                      {activeSkill.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activeSkill.description}</p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span>Highest Bid: <span className="text-amber-400 font-bold">
                      {activeAuctionData.highestBid?.amount?.toLocaleString() || "0"} gold
                    </span></span>
                    <span>Bids: {activeAuctionData.bids.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ends: {activeAuctionData.auction.endAt 
                      ? new Date(activeAuctionData.auction.endAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={finalizeAuction}
                  data-testid="button-finalize-auction"
                >
                  <Pause className="w-4 h-4 mr-2" /> Finalize Now
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active auction</p>
                {queuedAuctions.length > 0 && (
                  <Button className="mt-4" onClick={startNextAuction} data-testid="button-start-auction">
                    <Play className="w-4 h-4 mr-2" /> Start Next Auction
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add to Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search Skills</Label>
              <Input
                placeholder="Search by name or rarity..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                data-testid="input-skill-search"
              />
            </div>
            <div>
              <Label>Select Skill</Label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger data-testid="select-skill">
                  <SelectValue placeholder="Choose a skill" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSkills.map(skill => (
                    <SelectItem key={skill.id} value={skill.id}>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          skill.rarity === "common" && "bg-gray-400",
                          skill.rarity === "uncommon" && "bg-green-400",
                          skill.rarity === "rare" && "bg-blue-400",
                          skill.rarity === "epic" && "bg-purple-400",
                          skill.rarity === "legendary" && "bg-amber-400",
                          skill.rarity === "mythic" && "bg-pink-400",
                        )} />
                        {skill.name} ({skill.rarity})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addToQueue} disabled={!selectedSkillId} data-testid="button-add-to-queue">
              <Plus className="w-4 h-4 mr-2" /> Add to Queue
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Queue ({queuedAuctions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queuedAuctions.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No skills in queue. Add some skills above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queuedAuctions.map((auction, index) => {
                  const skill = getSkillById(auction.skillId);
                  return (
                    <TableRow key={auction.id}>
                      <TableCell>#{index + 1}</TableCell>
                      <TableCell>{skill?.name || auction.skillId}</TableCell>
                      <TableCell>
                        {skill && (
                          <Badge className={rarityColors[skill.rarity]}>
                            {skill.rarity}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(auction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromQueue(auction.id)}
                          data-testid={`button-remove-${auction.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("items");
  const [selectedTier, setSelectedTier] = useState<ItemTier | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [giveItemDialog, setGiveItemDialog] = useState<Item | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [editPlayerDialog, setEditPlayerDialog] = useState<Account | null>(null);
  const [editValues, setEditValues] = useState({
    gold: 0,
    rubies: 0,
    soulShards: 0,
    focusedShards: 0,
    trainingPoints: 0,
    petExp: 0,
    runes: 0,
    pets: [] as string[],
    rank: "Novice" as PlayerRank,
    wins: 0,
    losses: 0,
    Str: 10,
    Spd: 10,
    Int: 10,
    Luck: 10,
    Pot: 0,
  });
  const [viewRegistrationsEvent, setViewRegistrationsEvent] = useState<Event | null>(null);

  interface EventRegistration {
    id: string;
    eventId: string;
    accountId: string;
    registeredAt: string;
    isAutoRegistered: boolean;
    username: string;
  }

  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/events", viewRegistrationsEvent?.id, "registrations"],
    queryFn: async () => {
      if (!viewRegistrationsEvent) return [];
      const response = await fetch(`/api/events/${viewRegistrationsEvent.id}/registrations`);
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    },
    enabled: !!viewRegistrationsEvent,
  });

  const { data: players = [], isLoading: playersLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  interface ChallengeWithNames extends Challenge {
    challengerName: string;
    challengedName: string;
    challengerOnline: boolean;
    challengedOnline: boolean;
    challengerStrength?: number;
    challengedStrength?: number;
    challengerPet?: { name: string; tier: string; elements: string[] } | null;
    challengedPet?: { name: string; tier: string; elements: string[] } | null;
  }

  const { data: acceptedChallenges = [], isLoading: challengesLoading } = useQuery<ChallengeWithNames[]>({
    queryKey: ["/api/admin/challenges"],
  });

  interface GuildBattleFighter {
    id: string;
    username: string;
    strength: number;
    pet?: { name: string; tier: string; elements: string[] } | null;
  }

  interface AdminGuildBattle {
    id: string;
    challengerGuildId: string;
    challengerGuildName: string;
    challengedGuildId: string;
    challengedGuildName: string;
    status: string;
    challengerFighters: string[];
    challengedFighters: string[];
    currentRound: number;
    challengerScore: number;
    challengedScore: number;
    challengerCurrentIndex: number;
    challengedCurrentIndex: number;
    allChallengerFighters: GuildBattleFighter[];
    allChallengedFighters: GuildBattleFighter[];
    currentFighters: {
      challenger: GuildBattleFighter | null;
      challenged: GuildBattleFighter | null;
    };
    totalRounds: number;
  }

  const { data: activeGuildBattles = [], isLoading: guildBattlesLoading } = useQuery<AdminGuildBattle[]>({
    queryKey: ["/api/admin/guild-battles"],
  });

  interface PetWithOwner extends Pet {
    ownerName: string;
  }

  const { data: adminPets = [], isLoading: petsLoading } = useQuery<PetWithOwner[]>({
    queryKey: ["/api/admin/pets"],
  });

  const [petSearchQuery, setPetSearchQuery] = useState("");
  const [selectedPetTier, setSelectedPetTier] = useState<PetTier | "all">("all");
  const [selectedPetElement, setSelectedPetElement] = useState<PetElement | "all">("all");
  const [createPetDialog, setCreatePetDialog] = useState(false);
  const [editPetDialog, setEditPetDialog] = useState<PetWithOwner | null>(null);
  const [newPet, setNewPet] = useState({
    accountId: "",
    name: "",
    element: "Fire" as PetElement,
    elements: ["Fire"] as PetElement[],
    tier: "egg" as PetTier,
    exp: 0,
    stats: { Str: 1, Spd: 1, Luck: 1, ElementalPower: 1 },
  });
  const [editPetValues, setEditPetValues] = useState({
    name: "",
    element: "Fire" as PetElement,
    elements: ["Fire"] as PetElement[],
    tier: "egg" as PetTier,
    exp: 0,
    stats: { Str: 1, Spd: 1, Luck: 1, ElementalPower: 1 },
  });

  const [createEventDialog, setCreateEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isMandatory: false,
  });

  interface QuestWithDetails {
    id: string;
    title: string;
    description: string;
    rewards: {
      gold?: number;
      rubies?: number;
      soulShards?: number;
      focusedShards?: number;
      trainingPoints?: number;
      runes?: number;
      petExp?: number;
    };
    status: string;
    createdAt: string;
    createdByName: string;
    assignments: Array<{
      id: string;
      questId: string;
      accountId: string;
      status: string;
      playerName: string;
    }>;
  }

  const { data: quests = [], isLoading: questsLoading } = useQuery<QuestWithDetails[]>({
    queryKey: ["/api/admin/quests"],
  });

  interface GuildWithDetails {
    id: string;
    name: string;
    masterId: string;
    masterName: string;
    memberCount: number;
    dungeonFloor: number;
    dungeonLevel: number;
    bank: { gold: number; rubies: number; soulShards: number; focusedShards: number; runes: number; trainingPoints?: number };
    members: Array<{
      accountId: string;
      username: string;
      isMaster: boolean;
      joinedAt: string;
    }>;
    createdAt: string;
  }

  const { data: guilds = [], isLoading: guildsLoading } = useQuery<GuildWithDetails[]>({
    queryKey: ["/api/admin/guilds", account?.id],
    queryFn: async () => {
      if (!account) return [];
      const response = await fetch(`/api/admin/guilds?adminId=${account.id}`);
      if (!response.ok) throw new Error("Failed to fetch guilds");
      return response.json();
    },
    enabled: !!account,
  });

  const [disbandGuildDialog, setDisbandGuildDialog] = useState<GuildWithDetails | null>(null);
  const [guildSearchQuery, setGuildSearchQuery] = useState("");

  const filteredGuilds = useMemo(() => {
    return guilds.filter(g => 
      g.name.toLowerCase().includes(guildSearchQuery.toLowerCase()) ||
      g.masterName.toLowerCase().includes(guildSearchQuery.toLowerCase())
    );
  }, [guilds, guildSearchQuery]);

  const [createQuestDialog, setCreateQuestDialog] = useState(false);
  const [assignQuestDialog, setAssignQuestDialog] = useState<QuestWithDetails | null>(null);
  const [newQuest, setNewQuest] = useState({
    title: "",
    description: "",
    rewards: {
      gold: 0,
      rubies: 0,
      soulShards: 0,
      focusedShards: 0,
      trainingPoints: 0,
      runes: 0,
      petExp: 0,
    },
  });

  useEffect(() => {
    if (!account || account.role !== "admin") {
      navigate("/");
      return;
    }
    
    const eventSource = new EventSource(`/api/admin/events?adminId=${account.id}`);
    
    eventSource.addEventListener("newPlayer", (event) => {
      const newPlayer = JSON.parse(event.data) as Account;
      queryClient.setQueryData<Account[]>(["/api/accounts"], (old) => {
        if (!old) return [newPlayer];
        if (old.find(p => p.id === newPlayer.id)) return old;
        return [...old, newPlayer];
      });
      toast({
        title: "New player registered!",
        description: `${newPlayer.username} has joined the server.`,
      });
    });

    eventSource.addEventListener("playerUpdate", (event) => {
      const updatedPlayer = JSON.parse(event.data) as Account;
      queryClient.setQueryData<Account[]>(["/api/accounts"], (old) => {
        if (!old) return [updatedPlayer];
        return old.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
      });
    });

    eventSource.addEventListener("challengeAccepted", (event) => {
      const data = JSON.parse(event.data);
      toast({
        title: "Challenge Accepted!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
    });

    eventSource.addEventListener("challengeCompleted", (event) => {
      const data = JSON.parse(event.data);
      toast({
        title: "Challenge Completed!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    });

    eventSource.addEventListener("petCreated", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
    });

    eventSource.addEventListener("petUpdated", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
    });

    eventSource.addEventListener("petDeleted", () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
    });
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, [account, toast]);

  const filteredItems = useMemo(() => {
    return ALL_ITEMS.filter((item) => {
      if (selectedTier !== "all" && item.tier !== selectedTier) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedTier, searchQuery]);

  const calculateTotalStats = (player: Account) => {
    const base = player.stats || { Str: 10, Spd: 10, Int: 10, Luck: 10, Pot: 0 };
    const total = { ...base };
    
    if (player.equipped) {
      Object.values(player.equipped).forEach((itemId) => {
        if (itemId) {
          const item = getItemById(itemId);
          if (item) {
            Object.entries(item.stats).forEach(([stat, val]) => {
              if (val && stat in total) {
                (total as any)[stat] += val;
              }
            });
          }
        }
      });
    }
    return total;
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      if (playerSearchQuery && !player.username.toLowerCase().includes(playerSearchQuery.toLowerCase())) return false;
      return true;
    });
  }, [players, playerSearchQuery]);

  const filteredPets = useMemo(() => {
    return adminPets.filter((pet) => {
      if (selectedPetTier !== "all" && pet.tier !== selectedPetTier) return false;
      if (selectedPetElement !== "all") {
        const petElems = (pet as any).elements || [pet.element];
        if (!petElems.includes(selectedPetElement)) return false;
      }
      if (petSearchQuery) {
        const query = petSearchQuery.toLowerCase();
        if (!pet.name.toLowerCase().includes(query) && !pet.ownerName.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [adminPets, selectedPetTier, selectedPetElement, petSearchQuery]);

  const handleCreatePet = async () => {
    if (!newPet.accountId || !newPet.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a player and enter a pet name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/pets", newPet);
      toast({
        title: "Pet Created!",
        description: `${newPet.name} has been given to the player.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
      setCreatePetDialog(false);
      setNewPet({
        accountId: "",
        name: "",
        element: "Fire",
        elements: ["Fire"],
        tier: "egg",
        exp: 0,
        stats: { Str: 1, Spd: 1, Luck: 1, ElementalPower: 1 },
      });
    } catch (error) {
      toast({
        title: "Failed to create pet",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const openEditPet = (pet: PetWithOwner) => {
    setEditPetDialog(pet);
    setEditPetValues({
      name: pet.name,
      element: pet.element as PetElement,
      elements: ((pet as any).elements as PetElement[]) || [pet.element as PetElement],
      tier: pet.tier as PetTier,
      exp: pet.exp,
      stats: pet.stats as { Str: number; Spd: number; Luck: number; ElementalPower: number },
    });
  };

  const handleSavePet = async () => {
    if (!editPetDialog) return;

    try {
      await apiRequest("PATCH", `/api/admin/pets/${editPetDialog.id}`, editPetValues);
      toast({
        title: "Pet Updated!",
        description: `${editPetValues.name} has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
      setEditPetDialog(null);
    } catch (error) {
      toast({
        title: "Failed to update pet",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePet = async (pet: PetWithOwner) => {
    if (!window.confirm(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/admin/pets/${pet.id}`);
      toast({
        title: "Pet Deleted",
        description: `${pet.name} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
    } catch (error) {
      toast({
        title: "Failed to delete pet",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuest = async () => {
    if (!newQuest.title.trim() || !newQuest.description.trim()) {
      toast({
        title: "Missing fields",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/quests", {
        title: newQuest.title,
        description: newQuest.description,
        rewards: newQuest.rewards,
        createdBy: account!.id,
      });
      toast({
        title: "Quest Created!",
        description: `${newQuest.title} has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      setCreateQuestDialog(false);
      setNewQuest({
        title: "",
        description: "",
        rewards: { gold: 0, rubies: 0, soulShards: 0, focusedShards: 0, trainingPoints: 0, runes: 0, petExp: 0 },
      });
    } catch (error) {
      toast({
        title: "Failed to create quest",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuest = async (quest: QuestWithDetails) => {
    if (!window.confirm(`Are you sure you want to delete "${quest.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/admin/quests/${quest.id}`);
      toast({
        title: "Quest Deleted",
        description: `${quest.title} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
    } catch (error) {
      toast({
        title: "Failed to delete quest",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleAssignQuest = async (questId: string, accountId: string) => {
    try {
      await apiRequest("POST", `/api/admin/quests/${questId}/assign`, { accountId });
      toast({
        title: "Quest Assigned!",
        description: "The quest has been assigned to the player.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      setAssignQuestDialog(null);
    } catch (error: any) {
      toast({
        title: "Failed to assign quest",
        description: error?.message || "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteQuest = async (questId: string, assignmentId: string) => {
    try {
      await apiRequest("POST", `/api/admin/quests/${questId}/complete/${assignmentId}`);
      toast({
        title: "Quest Completed!",
        description: "The player has received their rewards.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    } catch (error) {
      toast({
        title: "Failed to complete quest",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const petElementColors: Record<string, string> = {
    Fire: "text-red-500",
    Water: "text-blue-500",
    Earth: "text-amber-700",
    Air: "text-cyan-300",
    Lightning: "text-yellow-400",
    Ice: "text-sky-300",
    Nature: "text-green-500",
    Dark: "text-purple-900",
    Light: "text-yellow-200",
    Arcana: "text-violet-500",
    Chrono: "text-indigo-400",
    Plasma: "text-pink-500",
    Void: "text-gray-600",
    Aether: "text-teal-300",
    Hybrid: "text-orange-500",
    "Elemental Convergence": "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-green-500",
    Time: "text-amber-400",
    Space: "text-indigo-600",
  };

  const toggleElement = (element: PetElement, currentElements: PetElement[], setter: (elements: PetElement[]) => void) => {
    if (currentElements.includes(element)) {
      if (currentElements.length > 1) {
        setter(currentElements.filter(e => e !== element));
      }
    } else {
      setter([...currentElements, element]);
    }
  };

  const petTierColors: Record<PetTier, string> = {
    egg: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    baby: "bg-green-500/20 text-green-400 border-green-500/30",
    teen: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    adult: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    legend: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    mythic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };

  const handleGiveItem = async () => {
    if (!giveItemDialog || !playerName.trim()) return;

    try {
      await apiRequest("POST", "/api/admin/give-item", {
        playerUsername: playerName.trim(),
        itemId: giveItemDialog.id,
      });

      toast({
        title: "Item granted!",
        description: `${giveItemDialog.name} has been given to ${playerName.trim()}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setGiveItemDialog(null);
      setPlayerName("");
    } catch (error) {
      toast({
        title: "Failed to give item",
        description: "Player not found or server error.",
        variant: "destructive",
      });
    }
  };

  const openEditPlayer = (player: Account) => {
    setEditPlayerDialog(player);
    setEditValues({
      gold: player.gold,
      rubies: player.rubies ?? 0,
      soulShards: player.soulShards ?? 0,
      focusedShards: player.focusedShards ?? 0,
      trainingPoints: player.trainingPoints ?? 0,
      petExp: player.petExp ?? 0,
      runes: player.runes ?? 0,
      pets: player.pets ?? [],
      rank: player.rank as PlayerRank,
      wins: player.wins,
      losses: player.losses,
      Str: player.stats?.Str ?? 10,
      Spd: player.stats?.Spd ?? 10,
      Int: player.stats?.Int ?? 10,
      Luck: player.stats?.Luck ?? 10,
      Pot: player.stats?.Pot ?? 0,
    });
  };

  const getMinimumStats = (player: Account) => {
    const minStats = { Str: 0, Spd: 0, Int: 0, Luck: 0, Pot: 0 };
    if (!player.equipped) return minStats;

    Object.values(player.equipped).forEach((itemId) => {
      if (itemId) {
        const item = ALL_ITEMS.find((i) => i.id === itemId);
        if (item) {
          Object.entries(item.stats).forEach(([stat, val]) => {
            if (val && stat in minStats) {
              (minStats as any)[stat] += val;
            }
          });
        }
      }
    });
    return minStats;
  };

  const [scaling, setScaling] = useState(1);

  const handleStatChange = (stat: string, amount: number) => {
    setEditValues(prev => ({
      ...prev,
      [stat]: Math.max(0, (prev as any)[stat] + (amount * scaling))
    }));
  };

  const handleResourceChange = (resource: string, amount: number) => {
    setEditValues(prev => {
      const currentVal = (prev as any)[resource] || 0;
      const newVal = currentVal + (amount * scaling);
      return {
        ...prev,
        [resource]: Math.max(0, newVal)
      };
    });
  };

  const handleSavePlayer = async () => {
    if (!editPlayerDialog) return;

    const minStats = getMinimumStats(editPlayerDialog);
    const statsToValidate: (keyof typeof minStats)[] = ["Str", "Spd", "Int", "Luck", "Pot"];
    
    for (const stat of statsToValidate) {
      if (editValues[stat] < 0) {
        toast({
          title: "Invalid Stat",
          description: `${stat} cannot be less than 0`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await apiRequest("PATCH", `/api/accounts/${editPlayerDialog.id}`, {
        gold: editValues.gold,
        rubies: editValues.rubies,
        soulShards: editValues.soulShards,
        focusedShards: editValues.focusedShards,
        trainingPoints: editValues.trainingPoints,
        petExp: editValues.petExp,
        runes: editValues.runes,
        pets: editValues.pets,
        rank: editValues.rank,
        wins: editValues.wins,
        losses: editValues.losses,
        stats: {
          Str: editValues.Str,
          Spd: editValues.Spd,
          Int: editValues.Int,
          Luck: editValues.Luck,
          Pot: editValues.Pot,
        },
      });

      toast({
        title: "Player updated!",
        description: `${editPlayerDialog.username}'s data has been saved.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setEditPlayerDialog(null);
    } catch (error) {
      toast({
        title: "Failed to update player",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlayer = async (player: Account) => {
    if (!window.confirm(`Are you sure you want to delete player "${player.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/accounts/${player.id}`);
      toast({
        title: "Player deleted",
        description: `Account "${player.username}" has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    } catch (error) {
      toast({
        title: "Failed to delete player",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name.trim() || !newEvent.description.trim() || !newEvent.startDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/events", {
        name: newEvent.name.trim(),
        description: newEvent.description.trim(),
        startDate: new Date(newEvent.startDate),
        endDate: newEvent.endDate ? new Date(newEvent.endDate) : null,
        isMandatory: newEvent.isMandatory,
        createdBy: account!.id,
      });

      toast({
        title: "Event created!",
        description: newEvent.isMandatory 
          ? `${newEvent.name} created and all players have been auto-registered.`
          : `${newEvent.name} has been created.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setCreateEventDialog(false);
      setNewEvent({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        isMandatory: false,
      });
    } catch (error) {
      toast({
        title: "Failed to create event",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.name}"? This will also remove all registrations.`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/admin/events/${event.id}`);
      toast({
        title: "Event deleted",
        description: `${event.name} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    } catch (error) {
      toast({
        title: "Failed to delete event",
        description: "Server error occurred.",
        variant: "destructive",
      });
    }
  };

  if (!account || account.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-tier-x" />
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-admin-title">
                Admin Panel
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground" data-testid="text-admin-username">
                  Admin: {account.username}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="items" className="gap-2">
              <Gift className="w-4 h-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Users className="w-4 h-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Swords className="w-4 h-4" />
              Challenges
              {acceptedChallenges.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {acceptedChallenges.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pets" className="gap-2">
              <Cat className="w-4 h-4" />
              Pets
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2">
              <Target className="w-4 h-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="guilds" className="gap-2">
              <Castle className="w-4 h-4" />
              Guilds
            </TabsTrigger>
            <TabsTrigger value="guild_battles" className="gap-2">
              <Shield className="w-4 h-4" />
              Guild Battles
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger value="auctions" className="gap-2">
              <Gavel className="w-4 h-4" />
              Auctions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Item Management</h2>
              
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-admin-search"
                  />
                </div>

                <TierFilter selectedTier={selectedTier} onSelectTier={setSelectedTier} />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-admin-item-count">
                Showing {filteredItems.length} of {ALL_ITEMS.length} items
              </p>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Special</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell>
                        <ItemTypeIcon type={item.type} />
                      </TableCell>
                      <TableCell className="font-medium font-serif" data-testid={`text-admin-item-name-${item.id}`}>
                        {item.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", tierBadgeStyles[item.tier])}
                        >
                          {TIER_LABELS[item.tier]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 text-xs font-mono">
                          {Object.entries(item.stats).map(([stat, value]) =>
                            value ? (
                              <span key={stat} className="text-muted-foreground">
                                {stat}:{value}
                              </span>
                            ) : null
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.special && (
                          <Badge variant="secondary" className="text-xs">
                            {item.special}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Coins className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono text-sm">{item.price.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setGiveItemDialog(item)}
                          data-testid={`button-give-item-${item.id}`}
                        >
                          <Gift className="w-3.5 h-3.5 mr-1" />
                          Give
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="players">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Player Management</h2>
              
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search players..."
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-player-search"
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""} registered
              </p>
            </div>

            {playersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading players...</div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No players found</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <Card key={player.id} data-testid={`card-player-${player.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-base flex items-center justify-between gap-2">
                        <span>{player.username}</span>
                        <Badge variant="secondary">{player.rank}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const totalStats = calculateTotalStats(player);
                        return (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Coins className="w-4 h-4 text-primary" />
                              <span className="font-mono">{player.gold.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-tier-x" />
                              <span className="font-mono text-green-500">{player.wins}W</span>
                              <span>/</span>
                              <span className="font-mono text-red-500">{player.losses}L</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-purple-500" />
                              <span className="font-mono text-sm">F{player.npcFloor ?? 1}:{player.npcLevel ?? 1}</span>
                            </div>
                            <div className="col-span-2 grid grid-cols-4 gap-1 mt-1">
                              <div className="flex flex-col items-center p-1 rounded bg-stat-str/10 border border-stat-str/20">
                                <span className="text-[10px] text-muted-foreground uppercase">Str</span>
                                <span className="font-mono font-bold text-stat-str">{totalStats.Str}</span>
                              </div>
                              <div className="flex flex-col items-center p-1 rounded bg-stat-spd/10 border border-stat-spd/20">
                                <span className="text-[10px] text-muted-foreground uppercase">Spd</span>
                                <span className="font-mono font-bold text-stat-spd">{totalStats.Spd}</span>
                              </div>
                              <div className="flex flex-col items-center p-1 rounded bg-stat-int/10 border border-stat-int/20">
                                <span className="text-[10px] text-muted-foreground uppercase">Int</span>
                                <span className="font-mono font-bold text-stat-int">{totalStats.Int}</span>
                              </div>
                              <div className="flex flex-col items-center p-1 rounded bg-stat-luck/10 border border-stat-luck/20">
                                <span className="text-[10px] text-muted-foreground uppercase">Luck</span>
                                <span className="font-mono font-bold text-stat-luck">{totalStats.Luck}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          Base Stats: {player.stats?.Str}/{player.stats?.Spd}/{player.stats?.Int}/{player.stats?.Luck}
                        </Badge>
                      </div>

                      {player.equipped && (
                        <div className="space-y-1.5 border-t pt-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Equipped</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(player.equipped).map(([slot, itemId]) => {
                              if (!itemId) return null;
                              const item = getItemById(itemId);
                              if (!item) return null;
                              return (
                                <div key={slot} className="flex items-center gap-1.5 p-1 rounded bg-secondary/30 border border-border/50">
                                  <ItemTypeIcon type={item.type} />
                                  <span className="text-[10px] truncate font-medium">{item.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openEditPlayer(player)}
                          data-testid={`button-edit-player-${player.id}`}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePlayer(player)}
                          data-testid={`button-delete-player-${player.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="font-serif text-lg font-semibold">Event Management</h2>
              <Button onClick={() => setCreateEventDialog(true)} data-testid="button-create-event">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {eventsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No events created yet</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <Card key={event.id} data-testid={`card-event-${event.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-base flex items-center justify-between gap-2">
                        <span>{event.name}</span>
                        {event.isMandatory && (
                          <Badge variant="destructive" className="text-[10px]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Mandatory
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Start: {new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        {event.endDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setViewRegistrationsEvent(event)}
                          data-testid={`button-view-registrations-${event.id}`}
                        >
                          <Users className="w-3.5 h-3.5 mr-1" />
                          Registrations
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteEvent(event)}
                          data-testid={`button-delete-event-${event.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Challenge Management</h2>
              <p className="text-sm text-muted-foreground">
                Select winners for accepted challenges. The winner gains a win and the loser gains a loss.
              </p>
            </div>

            {challengesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading challenges...</div>
            ) : acceptedChallenges.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent className="pt-6">
                  <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">No Pending Challenges</h3>
                  <p className="text-muted-foreground">
                    When players accept challenges, they will appear here for you to select a winner.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedChallenges.map((challenge) => (
                  <Card key={challenge.id} className="border-yellow-500/50" data-testid={`card-challenge-${challenge.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-base flex items-center gap-2">
                        <Swords className="w-4 h-4 text-yellow-500" />
                        Match in Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${challenge.challengerOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                            <p className="font-medium">{challenge.challengerName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Challenger</p>
                          {challenge.challengerStrength !== undefined && (
                            <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-500">
                              STR: {challenge.challengerStrength.toLocaleString()}
                            </Badge>
                          )}
                          {challenge.challengerPet && (
                            <p className="text-xs text-purple-400 mt-1">{challenge.challengerPet.name}</p>
                          )}
                        </div>
                        <span className="text-muted-foreground px-2">vs</span>
                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${challenge.challengedOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                            <p className="font-medium">{challenge.challengedName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">Challenged</p>
                          {challenge.challengedStrength !== undefined && (
                            <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-500">
                              STR: {challenge.challengedStrength.toLocaleString()}
                            </Badge>
                          )}
                          {challenge.challengedPet && (
                            <p className="text-xs text-purple-400 mt-1">{challenge.challengedPet.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Accepted: {challenge.acceptedAt ? new Date(challenge.acceptedAt).toLocaleString() : "N/A"}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={async () => {
                            try {
                              await apiRequest("PATCH", `/api/admin/challenges/${challenge.id}/winner`, {
                                winnerId: challenge.challengerId,
                              });
                              toast({
                                title: "Winner Selected",
                                description: `${challenge.challengerName} wins!`,
                              });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
                            } catch (error) {
                              toast({
                                title: "Failed to set winner",
                                description: "Server error occurred.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid={`button-winner-challenger-${challenge.id}`}
                        >
                          <Trophy className="w-3.5 h-3.5 mr-1" />
                          {challenge.challengerName} Wins
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={async () => {
                            try {
                              await apiRequest("PATCH", `/api/admin/challenges/${challenge.id}/winner`, {
                                winnerId: challenge.challengedId,
                              });
                              toast({
                                title: "Winner Selected",
                                description: `${challenge.challengedName} wins!`,
                              });
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
                              queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
                            } catch (error) {
                              toast({
                                title: "Failed to set winner",
                                description: "Server error occurred.",
                                variant: "destructive",
                              });
                            }
                          }}
                          data-testid={`button-winner-challenged-${challenge.id}`}
                        >
                          <Trophy className="w-3.5 h-3.5 mr-1" />
                          {challenge.challengedName} Wins
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guild_battles">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Guild Battle Management</h2>
              <p className="text-sm text-muted-foreground">
                Tournament-style guild battles. Winner stays, loser's team advances to next fighter. Most points wins!
              </p>
            </div>

            {guildBattlesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading guild battles...</div>
            ) : activeGuildBattles.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent className="pt-6">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">No Active Guild Battles</h3>
                  <p className="text-muted-foreground">
                    When guilds accept battle challenges, they will appear here for you to judge.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeGuildBattles.map((battle) => (
                  <Card key={battle.id} className="border-orange-500/50" data-testid={`card-guild-battle-${battle.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-orange-500" />
                          Guild Battle - Round {battle.currentRound + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{battle.challengerGuildName}: {battle.challengerScore}</Badge>
                          <span className="text-muted-foreground">vs</span>
                          <Badge variant="secondary">{battle.challengedGuildName}: {battle.challengedScore}</Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* All Fighters Display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-center">{battle.challengerGuildName} Fighters</p>
                          <div className="space-y-1">
                            {battle.allChallengerFighters?.map((fighter, idx) => (
                              <div 
                                key={fighter.id} 
                                className={`p-2 rounded border text-sm ${idx === battle.challengerCurrentIndex ? 'bg-yellow-500/20 border-yellow-500' : idx < battle.challengerCurrentIndex ? 'opacity-40 line-through' : 'border-border'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{idx + 1}. {fighter.username}</span>
                                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                                    {fighter.strength.toLocaleString()}
                                  </Badge>
                                </div>
                                {fighter.pet && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Pet: {fighter.pet.name} ({fighter.pet.tier})
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-center">{battle.challengedGuildName} Fighters</p>
                          <div className="space-y-1">
                            {battle.allChallengedFighters?.map((fighter, idx) => (
                              <div 
                                key={fighter.id} 
                                className={`p-2 rounded border text-sm ${idx === battle.challengedCurrentIndex ? 'bg-yellow-500/20 border-yellow-500' : idx < battle.challengedCurrentIndex ? 'opacity-40 line-through' : 'border-border'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{idx + 1}. {fighter.username}</span>
                                  <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                                    {fighter.strength.toLocaleString()}
                                  </Badge>
                                </div>
                                {fighter.pet && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Pet: {fighter.pet.name} ({fighter.pet.tier})
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Current Fight */}
                      {battle.currentFighters.challenger && battle.currentFighters.challenged && (
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <p className="text-sm font-medium mb-3 text-center text-orange-400">Current Fight</p>
                          <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                              <p className="font-bold text-lg">{battle.currentFighters.challenger.username}</p>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                STR: {battle.currentFighters.challenger.strength.toLocaleString()}
                              </Badge>
                              {battle.currentFighters.challenger.pet && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {battle.currentFighters.challenger.pet.name}
                                </p>
                              )}
                            </div>
                            <div className="px-4">
                              <Swords className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="text-center flex-1">
                              <p className="font-bold text-lg">{battle.currentFighters.challenged.username}</p>
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                STR: {battle.currentFighters.challenged.strength.toLocaleString()}
                              </Badge>
                              {battle.currentFighters.challenged.pet && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {battle.currentFighters.challenged.pet.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                try {
                                  await apiRequest("PATCH", `/api/admin/guild-battles/${battle.id}/round-winner`, {
                                    winnerId: battle.currentFighters.challenger!.id,
                                  });
                                  toast({
                                    title: "Round Winner",
                                    description: `${battle.currentFighters.challenger!.username} wins! ${battle.challengedGuildName} advances next fighter.`,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/guild-battles"] });
                                } catch (error: any) {
                                  const msg = await error.json?.().catch(() => ({}));
                                  toast({
                                    title: "Failed to set winner",
                                    description: msg.error || "Server error occurred.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              data-testid={`button-guild-winner-challenger-${battle.id}`}
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              {battle.currentFighters.challenger.username} Wins
                            </Button>
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={async () => {
                                try {
                                  await apiRequest("PATCH", `/api/admin/guild-battles/${battle.id}/round-winner`, {
                                    winnerId: battle.currentFighters.challenged!.id,
                                  });
                                  toast({
                                    title: "Round Winner",
                                    description: `${battle.currentFighters.challenged!.username} wins! ${battle.challengerGuildName} advances next fighter.`,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["/api/admin/guild-battles"] });
                                } catch (error: any) {
                                  const msg = await error.json?.().catch(() => ({}));
                                  toast({
                                    title: "Failed to set winner",
                                    description: msg.error || "Server error occurred.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              data-testid={`button-guild-winner-challenged-${battle.id}`}
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              {battle.currentFighters.challenged.username} Wins
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pets">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold">Pet Management</h2>
                <Button onClick={() => setCreatePetDialog(true)} data-testid="button-create-pet">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Pet
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search pets or owners..."
                    value={petSearchQuery}
                    onChange={(e) => setPetSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-pet-search"
                  />
                </div>
                <Select value={selectedPetTier} onValueChange={(v) => setSelectedPetTier(v as PetTier | "all")}>
                  <SelectTrigger className="w-32" data-testid="select-pet-tier">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {petTiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPetElement} onValueChange={(v) => setSelectedPetElement(v as PetElement | "all")}>
                  <SelectTrigger className="w-40" data-testid="select-pet-element">
                    <SelectValue placeholder="Element" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Elements</SelectItem>
                    {petElements.map((element) => (
                      <SelectItem key={element} value={element}>{element}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-pet-count">
                Showing {filteredPets.length} of {adminPets.length} pets
              </p>
            </div>

            {petsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading pets...</div>
            ) : filteredPets.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent className="pt-6">
                  <Cat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-lg font-bold text-foreground mb-2">No Pets Found</h3>
                  <p className="text-muted-foreground">
                    {adminPets.length === 0 
                      ? "No pets have been created yet. Add a pet to a player to get started."
                      : "No pets match your search criteria."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Element</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>EXP</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPets.map((pet) => (
                      <TableRow key={pet.id} data-testid={`row-pet-${pet.id}`}>
                        <TableCell className="font-medium font-serif">{pet.name}</TableCell>
                        <TableCell>{pet.ownerName}</TableCell>
                        <TableCell>
                          <span className={cn("font-medium", petElementColors[pet.element] || "text-foreground")}>
                            {pet.element}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", petTierColors[pet.tier as PetTier])}>
                            {pet.tier.charAt(0).toUpperCase() + pet.tier.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pet.exp}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 text-xs font-mono">
                            {pet.stats && Object.entries(pet.stats as Record<string, number>).map(([stat, value]) => (
                              <span key={stat} className="text-muted-foreground">
                                {stat}:{value}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openEditPet(pet)}
                              data-testid={`button-edit-pet-${pet.id}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeletePet(pet)}
                              data-testid={`button-delete-pet-${pet.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quests">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold">Quest Management</h2>
                <Button onClick={() => setCreateQuestDialog(true)} data-testid="button-create-quest">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quest
                </Button>
              </div>
            </div>

            {questsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : quests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-serif text-lg font-medium">No Quests</h3>
                  <p className="text-muted-foreground mt-2">
                    Create your first quest to assign to players.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {quests.map((quest) => (
                  <Card key={quest.id} data-testid={`card-quest-${quest.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="font-serif">{quest.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{quest.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAssignQuestDialog(quest)}
                            data-testid={`button-assign-quest-${quest.id}`}
                          >
                            <Users className="w-3.5 h-3.5 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteQuest(quest)}
                            data-testid={`button-delete-quest-${quest.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium">Rewards:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {quest.rewards.gold ? <Badge variant="outline"><Coins className="w-3 h-3 mr-1 text-yellow-500" />{quest.rewards.gold} Gold</Badge> : null}
                            {quest.rewards.rubies ? <Badge variant="outline" className="text-red-500">{quest.rewards.rubies} Rubies</Badge> : null}
                            {quest.rewards.soulShards ? <Badge variant="outline" className="text-purple-500">{quest.rewards.soulShards} Soul Shards</Badge> : null}
                            {quest.rewards.focusedShards ? <Badge variant="outline" className="text-blue-500">{quest.rewards.focusedShards} Focused Shards</Badge> : null}
                            {quest.rewards.trainingPoints ? <Badge variant="outline" className="text-green-500">{quest.rewards.trainingPoints} Training Points</Badge> : null}
                            {quest.rewards.runes ? <Badge variant="outline" className="text-orange-500">{quest.rewards.runes} Runes</Badge> : null}
                            {quest.rewards.petExp ? <Badge variant="outline" className="text-pink-500">{quest.rewards.petExp} Pet Exp</Badge> : null}
                          </div>
                        </div>

                        {quest.assignments.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Assigned Players:</span>
                            <div className="mt-2 space-y-2">
                              {quest.assignments.map((assignment) => (
                                <div 
                                  key={assignment.id} 
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                  data-testid={`assignment-${assignment.id}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{assignment.playerName}</span>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        assignment.status === "pending" && "text-yellow-500",
                                        assignment.status === "accepted" && "text-blue-500",
                                        assignment.status === "completed" && "text-green-500",
                                        assignment.status === "rewarded" && "text-purple-500"
                                      )}
                                    >
                                      {assignment.status}
                                    </Badge>
                                  </div>
                                  {assignment.status === "accepted" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCompleteQuest(quest.id, assignment.id)}
                                      data-testid={`button-complete-${assignment.id}`}
                                    >
                                      <Check className="w-3.5 h-3.5 mr-1" />
                                      Mark Complete
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guilds">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Guild Management</h2>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search guilds or leaders..."
                  value={guildSearchQuery}
                  onChange={(e) => setGuildSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-admin-guild-search"
                />
              </div>
            </div>

            {guildsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading guilds...</div>
            ) : filteredGuilds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No guilds found</div>
            ) : (
              <div className="space-y-4">
                {filteredGuilds.map((guild) => (
                  <Card key={guild.id} data-testid={`card-guild-${guild.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Castle className="w-5 h-5 text-emerald-500" />
                          <CardTitle className="font-serif text-lg">{guild.name}</CardTitle>
                          <Badge variant="outline">{guild.memberCount}/4 members</Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDisbandGuildDialog(guild)}
                          data-testid={`button-disband-guild-${guild.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Disband
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Leader</p>
                          <p className="font-medium flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 text-yellow-500" />
                            {guild.masterName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dungeon Progress</p>
                          <p className="font-medium">Floor {guild.dungeonFloor} - Level {guild.dungeonLevel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bank Gold</p>
                          <p className="font-medium flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-yellow-500" />
                            {(guild.bank?.gold || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-medium text-sm">{new Date(guild.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4 p-3 bg-muted/30 rounded-md">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Rubies</p>
                          <p className="font-medium text-red-400">{(guild.bank?.rubies || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Soul Shards</p>
                          <p className="font-medium text-purple-400">{(guild.bank?.soulShards || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Focused Shards</p>
                          <p className="font-medium text-blue-400">{(guild.bank?.focusedShards || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Runes</p>
                          <p className="font-medium text-cyan-400">{(guild.bank?.runes || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Training Pts</p>
                          <p className="font-medium text-green-400">{(guild.bank?.trainingPoints || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Members</p>
                        <div className="flex flex-wrap gap-2">
                          {guild.members.map((member) => (
                            <Badge
                              key={member.accountId}
                              variant={member.isMaster ? "default" : "secondary"}
                              className="flex items-center gap-1"
                            >
                              {member.isMaster && <Crown className="w-3 h-3" />}
                              {member.username}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboards">
            <div className="mb-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Leaderboard Management</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Force refresh leaderboard caches. Leaderboards auto-update every 30 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "wins", label: "Wins", color: "text-yellow-500" },
                { id: "losses", label: "Losses", color: "text-red-500" },
                { id: "npc_progress", label: "NPC Tower", color: "text-purple-500" },
                { id: "rank", label: "Rank", color: "text-blue-500" },
                { id: "guild_dungeon", label: "Guild Dungeon", color: "text-emerald-500" },
              ].map((lb) => (
                <Card key={lb.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-5 h-5 ${lb.color}`} />
                        <span className="font-medium">{lb.label}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await apiRequest("POST", `/api/admin/leaderboards/${lb.id}/refresh`);
                            toast({
                              title: "Leaderboard refreshed",
                              description: `${lb.label} leaderboard has been refreshed.`,
                            });
                          } catch (error) {
                            toast({
                              title: "Refresh failed",
                              description: "Failed to refresh leaderboard.",
                              variant: "destructive",
                            });
                          }
                        }}
                        data-testid={`button-refresh-${lb.id}`}
                      >
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={async () => {
                  const types = ["wins", "losses", "npc_progress", "rank", "guild_dungeon"];
                  try {
                    for (const type of types) {
                      await apiRequest("POST", `/api/admin/leaderboards/${type}/refresh`);
                    }
                    toast({
                      title: "All leaderboards refreshed",
                      description: "All leaderboard caches have been refreshed.",
                    });
                  } catch (error) {
                    toast({
                      title: "Refresh failed",
                      description: "Failed to refresh all leaderboards.",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-refresh-all-leaderboards"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Refresh All Leaderboards
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="auctions">
            <SkillAuctionManagement account={account} toast={toast} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!disbandGuildDialog} onOpenChange={(open) => !open && setDisbandGuildDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Disband Guild
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disband the guild "{disbandGuildDialog?.name}"? This action cannot be undone.
              All {disbandGuildDialog?.memberCount} members will be removed and the guild bank contents will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDisbandGuildDialog(null)} data-testid="button-cancel-disband">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!disbandGuildDialog || !account) return;
                try {
                  await apiRequest("DELETE", `/api/admin/guilds/${disbandGuildDialog.id}?adminId=${account.id}`);
                  toast({
                    title: "Guild disbanded",
                    description: `${disbandGuildDialog.name} has been disbanded.`,
                  });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/guilds"] });
                  setDisbandGuildDialog(null);
                } catch (error) {
                  toast({
                    title: "Failed to disband guild",
                    description: "An error occurred while disbanding the guild.",
                    variant: "destructive",
                  });
                }
              }}
              data-testid="button-confirm-disband"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Disband Guild
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createQuestDialog} onOpenChange={setCreateQuestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Quest</DialogTitle>
            <DialogDescription>
              Create a quest with rewards that players can complete.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quest-title">Title *</Label>
              <Input
                id="quest-title"
                placeholder="Enter quest title..."
                value={newQuest.title}
                onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                data-testid="input-quest-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quest-description">Description *</Label>
              <Input
                id="quest-description"
                placeholder="Enter quest description..."
                value={newQuest.description}
                onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
                data-testid="input-quest-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Rewards</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["gold", "rubies", "soulShards", "focusedShards", "trainingPoints", "runes", "petExp"] as const).map((reward) => (
                  <div key={reward} className="flex items-center gap-2">
                    <Label className="text-xs w-24 capitalize">{reward.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      value={newQuest.rewards[reward]}
                      onChange={(e) => setNewQuest({
                        ...newQuest,
                        rewards: { ...newQuest.rewards, [reward]: parseInt(e.target.value) || 0 }
                      })}
                      data-testid={`input-quest-reward-${reward}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateQuestDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateQuest} data-testid="button-submit-quest">Create Quest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignQuestDialog} onOpenChange={(open) => !open && setAssignQuestDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Assign Quest</DialogTitle>
            <DialogDescription>
              Assign "{assignQuestDialog?.title}" to a player.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label>Select Player</Label>
            <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
              {players.filter(p => p.role === "player").map((player) => {
                const alreadyAssigned = assignQuestDialog?.assignments.some(a => a.accountId === player.id);
                return (
                  <Button
                    key={player.id}
                    variant={alreadyAssigned ? "secondary" : "outline"}
                    className="w-full justify-start"
                    disabled={alreadyAssigned}
                    onClick={() => assignQuestDialog && handleAssignQuest(assignQuestDialog.id, player.id)}
                    data-testid={`button-assign-to-${player.id}`}
                  >
                    {player.username}
                    {alreadyAssigned && <span className="ml-2 text-xs text-muted-foreground">(Already assigned)</span>}
                  </Button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignQuestDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createPetDialog} onOpenChange={setCreatePetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Add New Pet</DialogTitle>
            <DialogDescription>
              Create a new pet and assign it to a player.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Player *</Label>
              <Select value={newPet.accountId} onValueChange={(v) => setNewPet({ ...newPet, accountId: v })}>
                <SelectTrigger data-testid="select-pet-owner">
                  <SelectValue placeholder="Select a player..." />
                </SelectTrigger>
                <SelectContent>
                  {players.filter(p => p.role === "player").map((player) => (
                    <SelectItem key={player.id} value={player.id}>{player.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-name">Pet Name *</Label>
              <Input
                id="pet-name"
                placeholder="Enter pet name..."
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                data-testid="input-pet-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={newPet.tier} onValueChange={(v) => setNewPet({ ...newPet, tier: v as PetTier })}>
                <SelectTrigger data-testid="select-new-pet-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {petTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Elements (select one or more)</Label>
              <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto border rounded-md p-2">
                {petElements.map((element) => (
                  <Button
                    key={element}
                    type="button"
                    size="sm"
                    variant={newPet.elements.includes(element) ? "default" : "outline"}
                    onClick={() => toggleElement(element, newPet.elements, (elements) => setNewPet({ ...newPet, elements, element: elements[0] }))}
                    className={`text-xs h-7 ${newPet.elements.includes(element) ? "" : petElementColors[element]}`}
                    data-testid={`button-toggle-element-${element}`}
                  >
                    {element}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Selected: {newPet.elements.join(", ")}</p>
            </div>

            <div className="space-y-2">
              <Label>Starting Stats</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Str", "Spd", "Luck", "ElementalPower"].map((stat) => (
                  <div key={stat} className="flex items-center gap-2">
                    <Label className="text-xs w-24">{stat}</Label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8"
                      value={(newPet.stats as any)[stat]}
                      onChange={(e) => setNewPet({
                        ...newPet,
                        stats: { ...newPet.stats, [stat]: parseInt(e.target.value) || 1 }
                      })}
                      data-testid={`input-new-pet-${stat}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreatePetDialog(false)} data-testid="button-cancel-create-pet">
              Cancel
            </Button>
            <Button onClick={handleCreatePet} data-testid="button-confirm-create-pet">
              <Plus className="w-4 h-4 mr-2" />
              Create Pet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPetDialog} onOpenChange={(open) => !open && setEditPetDialog(null)}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-serif">Edit Pet</DialogTitle>
            <DialogDescription>
              Modify pet attributes for {editPetDialog?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label htmlFor="edit-pet-name">Pet Name</Label>
              <Input
                id="edit-pet-name"
                value={editPetValues.name}
                onChange={(e) => setEditPetValues({ ...editPetValues, name: e.target.value })}
                data-testid="input-edit-pet-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={editPetValues.tier} onValueChange={(v) => setEditPetValues({ ...editPetValues, tier: v as PetTier })}>
                <SelectTrigger data-testid="select-edit-pet-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {petTiers.map((tier) => (
                    <SelectItem key={tier} value={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Elements (select one or more)</Label>
              <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto border rounded-md p-2">
                {petElements.map((element) => (
                  <Button
                    key={element}
                    type="button"
                    size="sm"
                    variant={editPetValues.elements.includes(element) ? "default" : "outline"}
                    onClick={() => toggleElement(element, editPetValues.elements, (elements) => setEditPetValues({ ...editPetValues, elements, element: elements[0] }))}
                    className={`text-xs h-7 ${editPetValues.elements.includes(element) ? "" : petElementColors[element]}`}
                    data-testid={`button-edit-toggle-element-${element}`}
                  >
                    {element}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Selected: {editPetValues.elements.join(", ")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pet-exp">EXP</Label>
              <Input
                id="edit-pet-exp"
                type="number"
                min={0}
                value={editPetValues.exp}
                onChange={(e) => setEditPetValues({ ...editPetValues, exp: parseInt(e.target.value) || 0 })}
                data-testid="input-edit-pet-exp"
              />
            </div>

            <div className="space-y-2">
              <Label>Stats</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Str", "Spd", "Luck", "ElementalPower"].map((stat) => (
                  <div key={stat} className="flex items-center gap-2">
                    <Label className="text-xs w-24">{stat}</Label>
                    <Input
                      type="number"
                      min={1}
                      className="h-8"
                      value={(editPetValues.stats as any)[stat]}
                      onChange={(e) => setEditPetValues({
                        ...editPetValues,
                        stats: { ...editPetValues.stats, [stat]: parseInt(e.target.value) || 1 }
                      })}
                      data-testid={`input-edit-pet-${stat}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4">
            <Button variant="outline" onClick={() => setEditPetDialog(null)} data-testid="button-cancel-edit-pet">
              Cancel
            </Button>
            <Button onClick={handleSavePet} data-testid="button-save-pet">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createEventDialog} onOpenChange={setCreateEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Event</DialogTitle>
            <DialogDescription>
              Create an event for players to register for.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name *</Label>
              <Input
                id="event-name"
                placeholder="Enter event name..."
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                data-testid="input-event-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description *</Label>
              <Input
                id="event-description"
                placeholder="Describe the event..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                data-testid="input-event-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start Date *</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  data-testid="input-event-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">End Date</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  data-testid="input-event-end"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <input
                id="event-mandatory"
                type="checkbox"
                checked={newEvent.isMandatory}
                onChange={(e) => setNewEvent({ ...newEvent, isMandatory: e.target.checked })}
                className="w-4 h-4"
                data-testid="checkbox-event-mandatory"
              />
              <div>
                <Label htmlFor="event-mandatory" className="text-sm font-medium cursor-pointer">
                  Mandatory Event
                </Label>
                <p className="text-xs text-muted-foreground">
                  All players will be auto-registered and notified
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateEventDialog(false)} data-testid="button-cancel-event">
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} data-testid="button-confirm-event">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!giveItemDialog} onOpenChange={() => setGiveItemDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Give Item to Player</DialogTitle>
            <DialogDescription>
              Grant {giveItemDialog?.name} to a player.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Username</Label>
              <Input
                id="player-name"
                placeholder="Enter player username..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                data-testid="input-player-name"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGiveItemDialog(null)} data-testid="button-cancel-give">
              Cancel
            </Button>
            <Button onClick={handleGiveItem} disabled={!playerName.trim()} data-testid="button-confirm-give">
              <Gift className="w-4 h-4 mr-2" />
              Give Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPlayerDialog} onOpenChange={() => setEditPlayerDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Player: {editPlayerDialog?.username}</DialogTitle>
            <DialogDescription>
              Modify player stats, gold, rank, and record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b flex-wrap">
              <Label className="text-xs text-muted-foreground">Scale:</Label>
              <div className="flex gap-1 flex-wrap">
                {[1, 10, 100, 1000, 10000, 100000, 1000000, 1000000000].map((val) => (
                  <Button
                    key={val}
                    size="sm"
                    variant={scaling === val ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setScaling(val)}
                    data-testid={`button-scale-${val}`}
                  >
                    +{val >= 1000000000 ? '1B' : val >= 1000000 ? '1M' : val >= 1000 ? `${val/1000}K` : val}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gold</Label>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("gold", -1)}
                    data-testid="button-deduct-gold"
                  >
                    -
                  </Button>
                  <Input
                    type="text"
                    value={editValues.gold.toLocaleString()}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9]/g, '');
                      setEditValues({ ...editValues, gold: parseInt(cleaned) || 0 });
                    }}
                    className="text-center text-sm"
                    data-testid="input-edit-gold"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("gold", 1)}
                    data-testid="button-add-gold"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rank</Label>
                <Select value={editValues.rank} onValueChange={(v) => setEditValues({ ...editValues, rank: v as PlayerRank })}>
                  <SelectTrigger data-testid="select-edit-rank">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {playerRanks.map((rank) => (
                      <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wins</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("wins", -1)}
                    data-testid="button-deduct-wins"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={editValues.wins}
                    onChange={(e) => setEditValues({ ...editValues, wins: parseInt(e.target.value) || 0 })}
                    className="text-center"
                    data-testid="input-edit-wins"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("wins", 1)}
                    data-testid="button-add-wins"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Losses</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("losses", -1)}
                    data-testid="button-deduct-losses"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={editValues.losses}
                    onChange={(e) => setEditValues({ ...editValues, losses: parseInt(e.target.value) || 0 })}
                    className="text-center"
                    data-testid="input-edit-losses"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => handleResourceChange("losses", 1)}
                    data-testid="button-add-losses"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block">Player Base Stats</Label>
              <div className="grid grid-cols-2 gap-4">
                {(["Str", "Spd", "Int", "Luck", "Pot"] as const).map((stat) => {
                  if (!editPlayerDialog) return null;
                  const minValue = 0;
                  return (
                    <div key={stat} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">{stat}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleStatChange(stat, -1)}
                          data-testid={`button-deduct-${stat}`}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          className="h-8 text-center font-mono"
                          value={editValues[stat]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setEditValues({ ...editValues, [stat]: Math.max(minValue, val) });
                          }}
                          data-testid={`input-edit-${stat}`}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => handleStatChange(stat, 1)}
                          data-testid={`button-add-${stat}`}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-3 block">Resources</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "rubies", label: "Rubies" },
                  { key: "soulShards", label: "Soul Shards" },
                  { key: "focusedShards", label: "Focused Shards" },
                  { key: "trainingPoints", label: "Training Points" },
                  { key: "petExp", label: "Pet EXP" },
                  { key: "runes", label: "Runes (Pet Elemental)" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleResourceChange(key, -1)}
                        data-testid={`button-deduct-${key}`}
                      >
                        -
                      </Button>
                      <Input
                        type="text"
                        className="h-7 text-center text-xs"
                        value={((editValues as any)[key] || 0).toLocaleString()}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9]/g, '');
                          setEditValues({ ...editValues, [key]: parseInt(cleaned) || 0 });
                        }}
                        data-testid={`input-edit-${key}`}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleResourceChange(key, 1)}
                        data-testid={`button-add-${key}`}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">Pets (comma-separated)</Label>
                  <Input
                    value={editValues.pets.join(", ")}
                    onChange={(e) => setEditValues({ ...editValues, pets: e.target.value.split(",").map(p => p.trim()).filter(p => p) })}
                    placeholder="Dragon, Wolf, Phoenix"
                    data-testid="input-edit-pets"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (!editPlayerDialog) return;
                try {
                  await apiRequest("POST", `/api/admin/accounts/${editPlayerDialog.id}/cap-resources`);
                  toast({ title: "Resources Fixed", description: "All resource values have been capped to safe limits." });
                  queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
                  setEditPlayerDialog(null);
                } catch (error) {
                  toast({ title: "Error", description: "Failed to fix resources", variant: "destructive" });
                }
              }}
              data-testid="button-fix-resources"
            >
              Fix Oversized Resources
            </Button>
            <Button variant="outline" onClick={() => setEditPlayerDialog(null)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSavePlayer} data-testid="button-save-player">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewRegistrationsEvent} onOpenChange={(open) => !open && setViewRegistrationsEvent(null)}>
        <DialogContent className="max-w-lg" data-testid="dialog-view-registrations">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Registrations: {viewRegistrationsEvent?.name}
            </DialogTitle>
            <DialogDescription>
              {viewRegistrationsEvent?.isMandatory 
                ? "This is a mandatory event - all players are auto-registered."
                : "Players who have registered for this event."}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto">
            {registrationsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading registrations...</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No players registered yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id} data-testid={`row-registration-${reg.id}`}>
                      <TableCell className="font-medium">{reg.username}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(reg.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reg.isAutoRegistered ? "secondary" : "default"}>
                          {reg.isAutoRegistered ? "Auto" : "Manual"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                Total: {registrations.length} player{registrations.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" onClick={() => setViewRegistrationsEvent(null)} data-testid="button-close-registrations">
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
