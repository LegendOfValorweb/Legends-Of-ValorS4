import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/lib/game-context";
import { getItemById, ALL_ITEMS } from "@/lib/items-data";
import { ItemGrid } from "@/components/item-grid";
import { GoldDisplay } from "@/components/gold-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, ShoppingBag, LogOut, Backpack, Sword, Shield, Gem, Trophy, Target, Zap, Brain, Clover, FlaskConical, User, Sparkles, Heart, Star, Calendar, Swords, ScrollText, Users, Coins, DollarSign, ArrowLeftRight } from "lucide-react";
import type { Item, ItemTier, InventoryItem, Stats } from "@shared/schema";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const tierBorderStyles: Record<ItemTier, string> = {
  normal: "border-tier-normal",
  super_rare: "border-tier-super-rare",
  x_tier: "border-tier-x",
  umr: "border-tier-umr",
  ssumr: "border-tier-ssumr",
  divine: "border-tier-x",
  journeyman: "border-tier-normal",
  expert: "border-tier-super-rare",
  master: "border-tier-x",
  grandmaster: "border-tier-umr",
  legend: "border-tier-ssumr",
  elite: "border-tier-ssumr",
};

function StatDisplay({ stat, value, icon }: { stat: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/30">
      <div className="text-muted-foreground">{icon}</div>
      <div className="text-sm">
        <span className="text-muted-foreground">{stat}</span>
        <span className="font-mono font-bold ml-2">{value}</span>
      </div>
    </div>
  );
}

function EquipmentSlot({
  slot,
  item,
  inventoryItem,
  label,
  icon,
  onUnequip,
  onBoost,
}: {
  slot: string;
  item: Item | null;
  inventoryItem: InventoryItem | null;
  label: string;
  icon: React.ReactNode;
  onUnequip: (e: React.MouseEvent) => void;
  onBoost: () => void;
}) {
  const boostedStats = (inventoryItem?.stats as Partial<Stats>) || {};

  return (
    <div
      className={cn(
        "p-3 rounded-md border-2 border-dashed transition-colors",
        item ? tierBorderStyles[item.tier] + " bg-card" : "border-muted bg-secondary/20"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
      </div>
      {item ? (
        <div className="space-y-2">
          <p className="font-serif font-semibold text-sm">{item.name}</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(item.stats).map(([stat, val]) => {
              const boost = boostedStats[stat as keyof Stats] || 0;
              const total = (val || 0) + boost;
              if (total === 0) return null;
              return (
                <Badge key={stat} variant="secondary" className="text-xs font-mono">
                  +{total} {stat}
                  {boost > 0 && <span className="ml-1 text-tier-x">(+{boost})</span>}
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={onUnequip} className="flex-1" data-testid={`button-unequip-${slot}`}>
              Unequip
            </Button>
            {(item.type === "weapon" || item.type === "armor" || item.type === "accessory") && (
              <Button size="sm" variant="secondary" onClick={onBoost} className="gap-1 px-2" data-testid={`button-boost-${slot}`}>
                <Star className="w-3 h-3 text-tier-x fill-tier-x" />
                Boost
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">Empty slot</p>
      )}
    </div>
  );
}

export default function Inventory() {
  const [, navigate] = useLocation();
  const { account, inventory, logout, setAccount, refreshInventory } = useGame();
  const { toast } = useToast();
  const [equipDialog, setEquipDialog] = useState<{ slot: string; type: "weapon" | "armor" | "accessory" } | null>(null);
  const [boostDialog, setBoostDialog] = useState<InventoryItem | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostScaling, setBoostScaling] = useState(1);
  const [sellDialog, setSellDialog] = useState<{ inventoryItem: InventoryItem; item: Item } | null>(null);
  const [isSelling, setIsSelling] = useState(false);

  // Ranks that can sell items
  const SELL_RANKS = ["Journeyman", "Expert", "Master", "Grandmaster", "Legend", "Elite"];
  const canSell = account ? SELL_RANKS.includes(account.rank) : false;

  const maxBoostByRank = useMemo(() => {
    const rankMaxBoost: Record<string, number> = {
      "Novice": 999,
      "Apprentice": 9999,
      "Journeyman": 99999,
      "Expert": 999999,
      "Master": 9999999,
      "Grandmaster": 99999999,
      "Legend": 999999999,
      "Elite": 9999999999,
    };
    return rankMaxBoost[account?.rank || "Novice"] || 999;
  }, [account?.rank]);

  const inventoryItems = useMemo(() => {
    return inventory
      .map((inv) => {
        const baseItem = getItemById(inv.itemId);
        if (!baseItem) return undefined;
        return {
          ...baseItem,
          inventoryId: inv.id,
          boostedStats: (inv.stats as Partial<Stats>) || {}
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }, [inventory]);

  const equippedItems = useMemo(() => {
    if (!account) return { weapon: null, armor: null, accessory1: null, accessory2: null };
    
    const findInvItem = (itemId: string | null) => {
      if (!itemId) return null;
      const inv = inventory.find(i => i.itemId === itemId);
      if (!inv) return null;
      return {
        item: getItemById(inv.itemId)!,
        invItem: inv
      };
    };

    return {
      weapon: findInvItem(account.equipped?.weapon),
      armor: findInvItem(account.equipped?.armor),
      accessory1: findInvItem(account.equipped?.accessory1),
      accessory2: findInvItem(account.equipped?.accessory2),
    };
  }, [account, inventory]);

  const calculatedStats = useMemo(() => {
    const base = account?.stats || { Str: 10, Spd: 10, Int: 10, Luck: 10, Pot: 0 };
    const bonus = { Str: 0, Spd: 0, Int: 0, Luck: 0, Pot: 0 };
    
    Object.values(equippedItems).forEach((equipped) => {
      if (equipped) {
        const { item, invItem } = equipped;
        const boosted = (invItem.stats as Partial<Stats>) || {};
        Object.entries(item.stats).forEach(([stat, val]) => {
          if (stat in bonus) {
            (bonus as any)[stat] += (val || 0) + (boosted[stat as keyof Stats] || 0);
          }
        });
      }
    });

    return {
      Str: base.Str + bonus.Str,
      Spd: base.Spd + bonus.Spd,
      Int: base.Int + bonus.Int,
      Luck: base.Luck + bonus.Luck,
      Pot: base.Pot + bonus.Pot,
    };
  }, [account, equippedItems]);

  const availableForSlot = useMemo(() => {
    if (!equipDialog) return [];
    const type = equipDialog.type;
    return inventoryItems.filter((item) => item.type === type);
  }, [equipDialog, inventoryItems]);

  const totalValue = useMemo(() => {
    return inventoryItems.reduce((sum, item) => sum + item.price, 0);
  }, [inventoryItems]);

  const handleEquip = async (item: { inventoryId: string, id: string }, slot: string) => {
    if (!account) return;
    const newEquipped = { ...account.equipped, [slot]: item.id };
    try {
      await apiRequest("PATCH", `/api/accounts/${account.id}`, { equipped: newEquipped });
      setAccount({ ...account, equipped: newEquipped });
      setEquipDialog(null);
      await refreshInventory();
    } catch (error) {
      console.error("Failed to equip item:", error);
    }
  };

  const handleUnequip = async (e: React.MouseEvent, slot: string) => {
    e.stopPropagation();
    if (!account) return;
    const newEquipped = { ...account.equipped, [slot]: null };
    try {
      await apiRequest("PATCH", `/api/accounts/${account.id}`, { equipped: newEquipped });
      setAccount({ ...account, equipped: newEquipped });
      await refreshInventory();
    } catch (error) {
      console.error("Failed to unequip item:", error);
    }
  };

  const handleBoost = async (stat: keyof Stats, amount: number = 1) => {
    if (!boostDialog || !account) return;
    const tpRequired = 10 * amount;
    if (account.trainingPoints < tpRequired) {
      toast({
        title: "Insufficient Training Points",
        description: `You need ${tpRequired} Training Points to boost by ${amount}.`,
        variant: "destructive",
      });
      return;
    }

    setIsBoosting(true);
    try {
      const res = await apiRequest("POST", `/api/inventory/${boostDialog.id}/boost`, { stat, amount });
      const data = await res.json();
      
      await refreshInventory();
      const accountRes = await apiRequest("GET", `/api/accounts/${account.id}`);
      setAccount(await accountRes.json());
      
      setBoostDialog({ ...boostDialog, stats: data.stats });

      toast({
        title: "Stat Boosted!",
        description: `Successfully boosted ${stat} by ${amount}.`,
      });
    } catch (error) {
      toast({
        title: "Boost Failed",
        description: "Could not boost weapon stat.",
        variant: "destructive",
      });
    } finally {
      setIsBoosting(false);
    }
  };

  const handleSell = async () => {
    if (!sellDialog || !account) return;
    
    setIsSelling(true);
    try {
      const res = await apiRequest("POST", `/api/accounts/${account.id}/inventory/${sellDialog.inventoryItem.id}/sell`, {
        originalPrice: sellDialog.item.price
      });
      const data = await res.json();
      
      await refreshInventory();
      const accountRes = await apiRequest("GET", `/api/accounts/${account.id}`);
      setAccount(await accountRes.json());
      
      toast({
        title: "Item Sold!",
        description: `Received ${data.goldReceived.toLocaleString()} gold for ${sellDialog.item.name}.`,
      });
      setSellDialog(null);
    } catch (error: any) {
      const errorData = await error.json?.() || { error: "Could not sell item." };
      toast({
        title: "Sell Failed",
        description: errorData.error,
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!account || account.role !== "player") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-inventory-title">
                My Inventory
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/shop")}
                  className="toggle-elevate"
                  data-testid="link-shop"
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Shop
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/skills")}
                  className="toggle-elevate"
                  data-testid="link-skills"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Skills
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/trading")}
                  className="toggle-elevate"
                  data-testid="link-trading"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-1.5" />
                  Trade
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/inventory")}
                  className="toggle-elevate toggle-elevated"
                  data-testid="link-inventory"
                >
                  <Package className="w-4 h-4 mr-1.5" />
                  Inventory ({inventory.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/pets")}
                  className="toggle-elevate"
                  data-testid="link-pets"
                >
                  <Heart className="w-4 h-4 mr-1.5" />
                  Pets
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/events")}
                  className="toggle-elevate"
                  data-testid="link-events"
                >
                  <Calendar className="w-4 h-4 mr-1.5" />
                  Events
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/challenges")}
                  className="toggle-elevate"
                  data-testid="link-challenges"
                >
                  <Swords className="w-4 h-4 mr-1.5" />
                  Challenges
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/npc-battle")}
                  className="toggle-elevate"
                  data-testid="link-npc-battle"
                >
                  <Target className="w-4 h-4 mr-1.5" />
                  NPC Tower
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/quests")}
                  className="toggle-elevate"
                  data-testid="link-quests"
                >
                  <ScrollText className="w-4 h-4 mr-1.5" />
                  Quests
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/leaderboard")}
                  className="toggle-elevate"
                  data-testid="link-leaderboard"
                >
                  <Trophy className="w-4 h-4 mr-1.5" />
                  Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/guild")}
                  className="toggle-elevate"
                  data-testid="link-guild"
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  Guild
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/skills")}
                  className="toggle-elevate"
                  data-testid="link-skills"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Skills
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground" data-testid="text-username">
                  {account.username}
                </p>
                <div className="flex items-center gap-2">
                  <GoldDisplay amount={account.gold} size="sm" />
                  <div className="flex items-center gap-1 text-xs font-mono text-tier-x">
                    <Star className="w-3 h-3 fill-tier-x" />
                    {account.trainingPoints || 0} TP
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex sm:hidden overflow-x-auto gap-1 mt-3 pb-2 -mx-4 px-4 scrollbar-hide">
            <Button variant="outline" size="sm" onClick={() => navigate("/shop")} className="shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate("/inventory")} className="shrink-0">
              <Package className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/pets")} className="shrink-0">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/events")} className="shrink-0">
              <Calendar className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/challenges")} className="shrink-0">
              <Swords className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/npc-battle")} className="shrink-0">
              <Target className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/quests")} className="shrink-0">
              <ScrollText className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/leaderboard")} className="shrink-0">
              <Trophy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/guild")} className="shrink-0">
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Character Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rank</span>
                <Badge variant="secondary">{account.rank}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Record</span>
                <span className="text-sm font-mono">
                  <span className="text-green-500">{account.wins}W</span>
                  {" / "}
                  <span className="text-red-500">{account.losses}L</span>
                </span>
              </div>
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-tier-x fill-tier-x" /> Training Points
                  </span>
                  <span className="text-sm font-mono text-tier-x">{account.trainingPoints || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Gem className="w-3 h-3 text-red-400" /> Rubies
                  </span>
                  <span className="text-sm font-mono text-red-400">{account.rubies || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Soul Shards
                  </span>
                  <span className="text-sm font-mono text-purple-400">{account.soulShards || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="w-3 h-3 text-blue-400" /> Focused Shards
                  </span>
                  <span className="text-sm font-mono text-blue-400">{account.focusedShards || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Total Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <StatDisplay stat="Str" value={calculatedStats.Str} icon={<Zap className="w-4 h-4 text-stat-str" />} />
                <StatDisplay stat="Spd" value={calculatedStats.Spd} icon={<Target className="w-4 h-4 text-stat-spd" />} />
                <StatDisplay stat="Int" value={calculatedStats.Int} icon={<Brain className="w-4 h-4 text-stat-int" />} />
                <StatDisplay stat="Luck" value={calculatedStats.Luck} icon={<Clover className="w-4 h-4 text-stat-luck" />} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Backpack className="w-4 h-4" />
                Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Items</span>
                <span className="font-mono font-bold">{inventoryItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Value</span>
                <GoldDisplay amount={totalValue} size="sm" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">Equipment Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setEquipDialog({ slot: "weapon", type: "weapon" })} className="cursor-pointer">
                <EquipmentSlot
                  slot="weapon"
                  item={equippedItems.weapon?.item || null}
                  inventoryItem={equippedItems.weapon?.invItem || null}
                  label="Weapon"
                  icon={<Sword className="w-4 h-4" />}
                  onUnequip={(e: React.MouseEvent) => handleUnequip(e, "weapon")}
                  onBoost={() => setBoostDialog(equippedItems.weapon?.invItem || null)}
                />
              </div>
              <div onClick={() => setEquipDialog({ slot: "armor", type: "armor" })} className="cursor-pointer">
                <EquipmentSlot
                  slot="armor"
                  item={equippedItems.armor?.item || null}
                  inventoryItem={equippedItems.armor?.invItem || null}
                  label="Armor"
                  icon={<Shield className="w-4 h-4" />}
                  onUnequip={(e: React.MouseEvent) => handleUnequip(e, "armor")}
                  onBoost={() => setBoostDialog(equippedItems.armor?.invItem || null)}
                />
              </div>
              <div onClick={() => setEquipDialog({ slot: "accessory1", type: "accessory" })} className="cursor-pointer">
                <EquipmentSlot
                  slot="accessory1"
                  item={equippedItems.accessory1?.item || null}
                  inventoryItem={equippedItems.accessory1?.invItem || null}
                  label="Accessory 1"
                  icon={<Gem className="w-4 h-4" />}
                  onUnequip={(e: React.MouseEvent) => handleUnequip(e, "accessory1")}
                  onBoost={() => setBoostDialog(equippedItems.accessory1?.invItem || null)}
                />
              </div>
              <div onClick={() => setEquipDialog({ slot: "accessory2", type: "accessory" })} className="cursor-pointer">
                <EquipmentSlot
                  slot="accessory2"
                  item={equippedItems.accessory2?.item || null}
                  inventoryItem={equippedItems.accessory2?.invItem || null}
                  label="Accessory 2"
                  icon={<Gem className="w-4 h-4" />}
                  onUnequip={(e: React.MouseEvent) => handleUnequip(e, "accessory2")}
                  onBoost={() => setBoostDialog(equippedItems.accessory2?.invItem || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-serif text-lg font-semibold">All Items</h2>
          {canSell ? (
            <Badge variant="outline" className="text-green-600 border-green-600/50">
              <DollarSign className="w-3 h-3 mr-1" />
              Selling Available (50% value)
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Reach Journeyman rank to sell items
            </Badge>
          )}
        </div>

        {inventoryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-full bg-secondary/50 mb-4">
              <Backpack className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-xl font-semibold mb-2">Your inventory is empty</h2>
            <p className="text-muted-foreground mb-6">Visit the shop to acquire legendary items!</p>
            <Button onClick={() => navigate("/shop")} data-testid="button-go-to-shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Go to Shop
            </Button>
          </div>
        ) : (
          <ItemGrid
            items={inventoryItems}
            showBuyButton={false}
            showSellButton={canSell}
            ownedItemIds={inventoryItems.map((i) => i.id)}
            onSell={(item) => {
              const invItem = inventory.find(inv => inv.itemId === item.id);
              if (invItem) {
                setSellDialog({ inventoryItem: invItem, item });
              }
            }}
          />
        )}
      </main>

      <Dialog open={!!equipDialog} onOpenChange={() => setEquipDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Equip {equipDialog?.type}</DialogTitle>
            <DialogDescription>
              Select an item from your inventory to equip.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableForSlot.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No {equipDialog?.type} items in inventory
              </p>
            ) : (
              availableForSlot.map((item) => (
                <Button
                  key={item.inventoryId}
                  variant="outline"
                  className="w-full justify-start h-auto py-2"
                  onClick={() => equipDialog && handleEquip(item, equipDialog.slot)}
                  data-testid={`button-equip-${item.inventoryId}`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-serif font-bold">{item.name}</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.stats).map(([stat, val]) => {
                        const boost = item.boostedStats[stat as keyof Stats] || 0;
                        const total = (val || 0) + boost;
                        if (total === 0) return null;
                        return (
                          <Badge key={stat} variant="secondary" className="text-[10px] px-1 h-4">
                            +{total} {stat}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!boostDialog} onOpenChange={() => { setBoostDialog(null); setBoostScaling(1); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Boost Equipment Stats</DialogTitle>
            <DialogDescription>
              Spend 10 Training Points per stat point. Max {maxBoostByRank.toLocaleString()} ({account?.rank || "Novice"} rank).
            </DialogDescription>
          </DialogHeader>
          {boostDialog && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-tier-x/10 border border-tier-x/20">
                <span className="text-sm font-medium">Available TP</span>
                <span className="font-mono font-bold text-tier-x">{account.trainingPoints || 0} TP</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Boost Amount:</span>
                {[1, 10, 100, 1000].map((scale) => (
                  <Button
                    key={scale}
                    size="sm"
                    variant={boostScaling === scale ? "default" : "outline"}
                    onClick={() => setBoostScaling(scale)}
                    data-testid={`button-boost-scale-${scale}`}
                  >
                    +{scale}
                  </Button>
                ))}
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Cost: {10 * boostScaling} TP per boost
              </div>
              
              <div className="grid gap-2">
                {["Str", "Int", "Spd", "Luck", "Pot"].map((stat) => {
                  const baseItem = getItemById(boostDialog.itemId);
                  if (!baseItem) return null;
                  const currentBoost = (boostDialog.stats as any)?.[stat] || 0;
                  const baseStat = (baseItem.stats as any)[stat] || 0;
                  const total = baseStat + currentBoost;
                  const tpRequired = 10 * boostScaling;

                  return (
                    <div key={stat} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold uppercase">{stat}</span>
                        <span className="text-xs text-muted-foreground">
                          Total: {total} (Base: {baseStat} + Boost: {currentBoost})
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        disabled={isBoosting || account.trainingPoints < tpRequired || total >= maxBoostByRank}
                        onClick={() => handleBoost(stat as keyof Stats, boostScaling)}
                        className="gap-1"
                        data-testid={`button-boost-${stat}`}
                      >
                        +{boostScaling} {stat}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBoostDialog(null); setBoostScaling(1); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sellDialog} onOpenChange={() => setSellDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Sell Item
            </DialogTitle>
            <DialogDescription>
              Sell this item for 50% of its original value.
            </DialogDescription>
          </DialogHeader>
          {sellDialog && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-serif font-semibold">{sellDialog.item.name}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(sellDialog.item.stats).map(([stat, val]) => {
                    if (!val) return null;
                    return (
                      <Badge key={stat} variant="secondary" className="text-xs">
                        +{val} {stat}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 rounded-md bg-secondary/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Original Price</p>
                  <p className="font-mono font-bold text-muted-foreground line-through">
                    {sellDialog.item.price.toLocaleString()} gold
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-500">You Receive</p>
                  <p className="font-mono font-bold text-green-500">
                    {Math.floor(sellDialog.item.price * 0.5).toLocaleString()} gold
                  </p>
                </div>
              </div>

              <div className="text-center text-xs text-amber-500">
                This action cannot be undone!
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialog(null)}>Cancel</Button>
            <Button 
              onClick={handleSell}
              disabled={isSelling}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-sell"
            >
              <Coins className="w-4 h-4 mr-2" />
              {isSelling ? "Selling..." : "Sell Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
