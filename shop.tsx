import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import type { Item, ItemTier, ItemType } from "@shared/schema";
import { playerRanks } from "@shared/schema";
import { ALL_ITEMS } from "@/lib/items-data";
import { useGame } from "@/lib/game-context";
import { ItemGrid } from "@/components/item-grid";
import { TierFilter } from "@/components/tier-filter";
import { TypeFilter } from "@/components/type-filter";
import { GoldDisplay } from "@/components/gold-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, ShoppingBag, LogOut, Calendar, Swords, Target, ScrollText, Trophy, Shield, Heart, Users, Sparkles, ArrowLeftRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemCard } from "@/components/item-card";

export default function Shop() {
  const [, navigate] = useLocation();
  const { account, inventory, addToInventory, logout } = useGame();
  const { toast } = useToast();

  const [selectedTier, setSelectedTier] = useState<ItemTier | "all">("all");
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmItem, setConfirmItem] = useState<Item | null>(null);

  const ownedItemIds = useMemo(
    () => inventory.map((inv) => inv.itemId),
    [inventory]
  );

  const tierRankRequirements: Record<ItemTier, typeof playerRanks[number]> = {
    normal: "Novice",
    super_rare: "Novice",
    x_tier: "Novice",
    umr: "Novice",
    ssumr: "Novice",
    divine: "Apprentice",
    journeyman: "Journeyman",
    expert: "Expert",
    master: "Master",
    grandmaster: "Grandmaster",
    legend: "Legend",
    elite: "Elite",
  };

  const excludedTiers = useMemo(() => {
    if (!account) {
      // While loading, only show basic tiers (Novice level)
      return ["divine", "journeyman", "expert", "master", "grandmaster", "legend", "elite"] as ItemTier[];
    }
    const playerRankIndex = playerRanks.indexOf(account.rank);
    return (Object.entries(tierRankRequirements) as [ItemTier, typeof playerRanks[number]][])
      .filter(([_, requiredRank]) => playerRanks.indexOf(requiredRank) > playerRankIndex)
      .map(([tier]) => tier);
  }, [account]);

  const filteredItems = useMemo(() => {
    return ALL_ITEMS.filter((item) => {
      if (excludedTiers.includes(item.tier)) return false;
      if (selectedTier !== "all" && item.tier !== selectedTier) return false;
      if (selectedType !== "all" && item.type !== selectedType) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [selectedTier, selectedType, searchQuery, excludedTiers]);

  const handleBuy = (item: Item) => {
    setConfirmItem(item);
  };

  const confirmPurchase = async () => {
    if (!confirmItem || !account) return;

    if (account.gold < confirmItem.price) {
      toast({
        title: "Not enough gold!",
        description: `You need ${confirmItem.price.toLocaleString()} gold to buy ${confirmItem.name}.`,
        variant: "destructive",
      });
      setConfirmItem(null);
      return;
    }

    const success = await addToInventory(confirmItem);
    if (success) {
      toast({
        title: "Purchase successful!",
        description: `You acquired ${confirmItem.name}!`,
      });
    } else {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setConfirmItem(null);
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
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-shop-title">
                Item Shop
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/shop")}
                  className="toggle-elevate toggle-elevated"
                  data-testid="link-shop"
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Shop
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/inventory")}
                  className="toggle-elevate"
                  data-testid="link-inventory"
                >
                  <Package className="w-4 h-4 mr-1.5" />
                  Inventory ({inventory.length})
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
                  <Shield className="w-4 h-4 mr-1.5" />
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
                <GoldDisplay amount={account.gold} size="sm" />
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
            <Button variant="secondary" size="sm" onClick={() => navigate("/shop")} className="shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/inventory")} className="shrink-0">
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
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>

          <div className="space-y-3">
            <TierFilter 
              selectedTier={selectedTier} 
              onSelectTier={setSelectedTier} 
              excludeTiers={excludedTiers}
            />
            <TypeFilter selectedType={selectedType} onSelectType={setSelectedType} />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground" data-testid="text-item-count">
            Showing {filteredItems.length} items
          </p>
        </div>

        <ItemGrid
          items={filteredItems}
          onBuy={handleBuy}
          showBuyButton
          ownedItemIds={ownedItemIds}
          playerGold={account.gold}
        />
      </main>

      <Dialog open={!!confirmItem} onOpenChange={() => setConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to buy this item?
            </DialogDescription>
          </DialogHeader>

          {confirmItem && (
            <div className="py-4">
              <ItemCard item={confirmItem} showBuyButton={false} />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmItem(null)} data-testid="button-cancel-purchase">
              Cancel
            </Button>
            <Button onClick={confirmPurchase} data-testid="button-confirm-purchase">
              Buy for {confirmItem?.price.toLocaleString()} gold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
