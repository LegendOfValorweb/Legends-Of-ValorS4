import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useGame } from "@/lib/game-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ALL_SKILLS, getSkillById, type SkillDefinition, type SkillRarity } from "@shared/skills-data";
import { GoldDisplay } from "@/components/gold-display";
import { 
  Gavel, Package, LogOut, ShoppingBag, Heart, Users, Swords, Shield, 
  Zap, Clock, Sparkles, Timer, Flame, Snowflake, Eye, Activity, 
  ArrowLeft, Trophy, ArrowLeftRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SkillAuction, SkillBid, PlayerSkill } from "@shared/schema";

const rarityColors: Record<SkillRarity, string> = {
  common: "bg-gray-500/20 text-gray-300 border-gray-500",
  uncommon: "bg-green-500/20 text-green-300 border-green-500",
  rare: "bg-blue-500/20 text-blue-300 border-blue-500",
  epic: "bg-purple-500/20 text-purple-300 border-purple-500",
  legendary: "bg-amber-500/20 text-amber-300 border-amber-500",
  mythic: "bg-pink-500/20 text-pink-300 border-pink-500",
};

const rarityBgColors: Record<SkillRarity, string> = {
  common: "from-gray-800/50 to-gray-900/80 border-gray-600/50",
  uncommon: "from-green-900/30 to-green-950/60 border-green-600/40",
  rare: "from-blue-900/30 to-blue-950/60 border-blue-600/40",
  epic: "from-purple-900/30 to-purple-950/60 border-purple-600/40",
  legendary: "from-amber-900/30 to-amber-950/60 border-amber-600/40",
  mythic: "from-pink-900/30 to-pink-950/60 border-pink-600/40 animate-pulse",
};

function formatTimeLeft(endAt: Date | string | null): string {
  if (!endAt) return "N/A";
  const end = new Date(endAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

function SkillCard({ skill, showActions, onEquip, onUnequip, isEquipped }: { 
  skill: SkillDefinition; 
  showActions?: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  isEquipped?: boolean;
}) {
  return (
    <Card className={`bg-gradient-to-br ${rarityBgColors[skill.rarity]} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-cinzel text-foreground">{skill.name}</CardTitle>
          <Badge className={rarityColors[skill.rarity]}>
            {skill.rarity.charAt(0).toUpperCase() + skill.rarity.slice(1)}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">{skill.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {skill.effects.map((effect, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {effect.type}: {effect.value}
              {effect.stat && ` ${effect.stat}`}
              {effect.duration && ` (${effect.duration}s)`}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {skill.cooldown}s
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4" /> {skill.manaCost} mana
          </span>
        </div>
        {showActions && (
          <div className="pt-2">
            {isEquipped ? (
              <Button variant="outline" size="sm" onClick={onUnequip} data-testid="button-unequip-skill">
                Unequip
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={onEquip} data-testid="button-equip-skill">
                Equip
              </Button>
            )}
          </div>
        )}
        {isEquipped && (
          <Badge className="bg-green-500/30 text-green-300 border-green-500">
            Equipped
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function Skills() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const { data: auctionData, isLoading: auctionLoading } = useQuery<{
    auction: SkillAuction | null;
    bids: SkillBid[];
    highestBid: SkillBid | null;
  }>({
    queryKey: ["/api/auctions/active"],
    refetchInterval: 5000,
  });

  const { data: playerSkills = [], isLoading: skillsLoading } = useQuery<PlayerSkill[]>({
    queryKey: ["/api/accounts", account?.id, "skills"],
    enabled: !!account?.id,
    refetchInterval: 10000,
  });

  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/activity-feed"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (auctionData?.auction?.endAt) {
      const interval = setInterval(() => {
        setTimeLeft(formatTimeLeft(auctionData.auction!.endAt));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auctionData?.auction?.endAt]);

  const placeBidMutation = useMutation({
    mutationFn: async () => {
      const amount = parseInt(bidAmount);
      if (!account || !auctionData?.auction) throw new Error("Not authenticated");
      const response = await apiRequest("POST", `/api/auctions/${auctionData.auction.id}/bid`, {
        accountId: account.id,
        amount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auctions/active"] });
      toast({ title: "Bid placed!", description: `You bid ${parseInt(bidAmount).toLocaleString()} gold.` });
      setShowBidDialog(false);
      setBidAmount("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to place bid", description: error.message, variant: "destructive" });
    },
  });

  const equipSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      if (!account) throw new Error("Not authenticated");
      const response = await apiRequest("POST", `/api/accounts/${account.id}/skills/${skillId}/equip`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "skills"] });
      toast({ title: "Skill equipped!" });
    },
    onError: () => {
      toast({ title: "Failed to equip skill", variant: "destructive" });
    },
  });

  const unequipSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      if (!account) throw new Error("Not authenticated");
      const response = await apiRequest("POST", `/api/accounts/${account.id}/skills/${skillId}/unequip`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "skills"] });
      toast({ title: "Skill unequipped!" });
    },
    onError: () => {
      toast({ title: "Failed to unequip skill", variant: "destructive" });
    },
  });

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <CardTitle>Please log in to access Skills</CardTitle>
          <Button className="mt-4" onClick={() => navigate("/")}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  const activeSkill = auctionData?.auction ? getSkillById(auctionData.auction.skillId) : null;
  const minBid = auctionData?.highestBid ? auctionData.highestBid.amount + 1 : 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/shop")} className="shrink-0" data-testid="button-back-shop">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-cinzel font-bold text-primary flex items-center gap-2 truncate">
              <Gavel className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" /> <span className="truncate">Skill Auction</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden xs:block">
              <GoldDisplay amount={account.gold} size="sm" />
            </div>
            <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[100px]">{account.username}</span>
            <Button variant="outline" size="sm" onClick={logout} className="h-8 px-2 sm:h-9 sm:px-4" data-testid="button-logout">
              <LogOut className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
        <nav className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
          <Button variant="ghost" size="sm" onClick={() => navigate("/shop")} data-testid="link-shop">
            <ShoppingBag className="h-4 w-4 mr-1" /> Shop
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} data-testid="link-inventory">
            <Package className="h-4 w-4 mr-1" /> Inventory
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} data-testid="link-pets">
            <Heart className="h-4 w-4 mr-1" /> Pets
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/guild")} data-testid="link-guild">
            <Users className="h-4 w-4 mr-1" /> Guild
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/npc-battle")} data-testid="link-tower">
            <Swords className="h-4 w-4 mr-1" /> Tower
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} data-testid="link-leaderboard">
            <Trophy className="h-4 w-4 mr-1" /> Leaderboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/trading")} data-testid="link-trading">
            <ArrowLeftRight className="h-4 w-4 mr-1" /> Trade
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6">
          <Tabs defaultValue="auction" className="space-y-6">
            <TabsList className="flex w-full mb-6 overflow-x-auto no-scrollbar justify-start sm:grid sm:grid-cols-3">
              <TabsTrigger value="auction" className="flex-1 min-w-[100px]" data-testid="tab-skills-auction">
                <Gavel className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Auction</span>
              </TabsTrigger>
              <TabsTrigger value="my-skills" className="flex-1 min-w-[100px]" data-testid="tab-skills-equipped">
                <Sparkles className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">My Skills</span>
              </TabsTrigger>
              <TabsTrigger value="news" className="flex-1 min-w-[100px]" data-testid="tab-skills-news">
                <Activity className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">News</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auction">
            <Card className="bg-gradient-to-br from-card to-card/80 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" /> 
                  Current Auction
                  {auctionData?.auction && (
                    <Badge variant="outline" className="ml-auto animate-pulse">
                      {timeLeft || formatTimeLeft(auctionData.auction.endAt)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auctionLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading auction...</div>
                ) : auctionData?.auction && activeSkill ? (
                  <div className="space-y-6">
                    <SkillCard skill={activeSkill} />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/30 rounded-lg gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground">Highest Bid</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-400">
                          {auctionData.highestBid 
                            ? `${auctionData.highestBid.amount.toLocaleString()} gold`
                            : "No bids yet"}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowBidDialog(true)}
                        disabled={!account || account.gold < minBid}
                        className="w-full sm:w-auto"
                        data-testid="button-place-bid"
                      >
                        <Gavel className="h-4 w-4 mr-2" /> Place Bid
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-muted-foreground">Recent Bids</h4>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {auctionData.bids.slice(0, 10).map((bid, i) => (
                            <div 
                              key={bid.id} 
                              className={`flex justify-between p-2 rounded ${i === 0 ? "bg-amber-500/20" : "bg-muted/20"}`}
                            >
                              <span className="text-sm">Bidder #{bid.bidderId.slice(-4)}</span>
                              <span className="font-semibold text-amber-400">
                                {bid.amount.toLocaleString()} gold
                              </span>
                            </div>
                          ))}
                          {auctionData.bids.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No bids yet. Be the first!</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active auction at the moment.</p>
                    <p className="text-sm text-muted-foreground mt-2">Check back later for the next skill auction!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Skills</CardTitle>
                <CardDescription>Browse all 100 unique skills in the game</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                    {ALL_SKILLS.map(skill => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Your Skills
                </CardTitle>
                <CardDescription>
                  Skills you've won from auctions. Equip one skill at a time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {skillsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading skills...</div>
                ) : playerSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">You don't have any skills yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">Win auctions to acquire powerful skills!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playerSkills.map(ps => {
                      const skill = getSkillById(ps.skillId);
                      if (!skill) return null;
                      return (
                        <SkillCard 
                          key={ps.id} 
                          skill={skill} 
                          showActions
                          isEquipped={ps.isEquipped}
                          onEquip={() => equipSkillMutation.mutate(ps.id)}
                          onUnequip={() => unequipSkillMutation.mutate(ps.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Activity Feed
                </CardTitle>
                <CardDescription>
                  Recent events and player achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity
                      </p>
                    ) : (
                      activities.map((activity: any) => (
                        <div 
                          key={activity.id}
                          className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
                        >
                          <div className="p-2 bg-primary/20 rounded">
                            {activity.type === "bid_won" && <Trophy className="h-4 w-4 text-amber-400" />}
                            {activity.type === "quest_completed" && <Shield className="h-4 w-4 text-green-400" />}
                            {activity.type === "pet_acquired" && <Heart className="h-4 w-4 text-pink-400" />}
                            {!["bid_won", "quest_completed", "pet_acquired"].includes(activity.type) && (
                              <Activity className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
            <DialogDescription>
              Minimum bid: {minBid.toLocaleString()} gold
              {auctionData?.highestBid && (
                <span className="block mt-1">
                  Current highest: {auctionData.highestBid.amount.toLocaleString()} gold
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bid Amount (Gold)</label>
              <Input
                type="number"
                placeholder={minBid.toString()}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minBid}
                data-testid="input-bid-amount"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Your gold: {account.gold.toLocaleString()}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBidDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => placeBidMutation.mutate()}
              disabled={
                !bidAmount ||
                parseInt(bidAmount) < minBid ||
                parseInt(bidAmount) > account.gold ||
                placeBidMutation.isPending
              }
              data-testid="button-confirm-bid"
            >
              {placeBidMutation.isPending ? "Placing..." : "Confirm Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
