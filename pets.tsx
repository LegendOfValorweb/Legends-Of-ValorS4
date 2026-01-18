import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Pet, PetTier, PetElement, PetFoodItem } from "@shared/schema";
import { petTierConfig, petTiers, petElements, petFoodItems } from "@shared/schema";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, Package, ShoppingBag, LogOut, Swords, Calendar, 
  Sparkles, Zap, Clover, Flame, ArrowUp, Plus, Minus, Target, ScrollText, Trophy, Coins, GitMerge, ArrowLeftRight
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const tierColors: Record<PetTier, string> = {
  egg: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  baby: "bg-green-500/20 text-green-400 border-green-500/30",
  teen: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  adult: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legend: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  mythic: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const tierEmojis: Record<PetTier, string> = {
  egg: "🥚",
  baby: "🐣",
  teen: "🐥",
  adult: "🦅",
  legend: "🌟",
  mythic: "🔥",
};

const elementColors: Record<string, string> = {
  Fire: "text-red-500",
  Water: "text-blue-500",
  Earth: "text-amber-600",
  Air: "text-sky-400",
  Lightning: "text-yellow-400",
  Ice: "text-cyan-300",
  Nature: "text-green-500",
  Dark: "text-purple-600",
  Light: "text-yellow-200",
  Arcana: "text-violet-500",
  Chrono: "text-indigo-400",
  Plasma: "text-pink-500",
  Void: "text-gray-600",
  Aether: "text-teal-400",
  Hybrid: "text-orange-500",
  "Elemental Convergence": "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-green-500",
  Time: "text-amber-400",
  Space: "text-indigo-600",
  Soul: "text-cyan-400",
  Mind: "text-pink-400",
};

export default function Pets() {
  const [, navigate] = useLocation();
  const { account, setAccount, logout } = useGame();
  const { toast } = useToast();
  const [feedDialog, setFeedDialog] = useState<Pet | null>(null);
  const [selectedFood, setSelectedFood] = useState<PetFoodItem | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [expFeedAmount, setExpFeedAmount] = useState(100);
  const [isEvolving, setIsEvolving] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergePet1, setMergePet1] = useState<Pet | null>(null);
  const [mergePet2, setMergePet2] = useState<Pet | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const { data: playerPets = [], isLoading: petsLoading, refetch: refetchPets } = useQuery<Pet[]>({
    queryKey: ["/api/accounts", account?.id, "pets"],
    queryFn: async () => {
      if (!account?.id) return [];
      const res = await fetch(`/api/accounts/${account.id}/pets`);
      return res.json();
    },
    enabled: !!account?.id,
  });

  const petsByTier = useMemo(() => {
    const grouped: Record<PetTier, Pet[]> = {
      egg: [],
      baby: [],
      teen: [],
      adult: [],
      legend: [],
      mythic: [],
    };
    
    playerPets.forEach(pet => {
      const tier = pet.tier as PetTier;
      if (grouped[tier]) {
        grouped[tier].push(pet);
      }
    });
    
    return grouped;
  }, [playerPets]);

  useEffect(() => {
    if (!account?.id) return;

    const eventSource = new EventSource(`/api/player/events?accountId=${account.id}`);

    eventSource.addEventListener("petAdded", (event) => {
      const newPet = JSON.parse(event.data) as Pet;
      queryClient.setQueryData<Pet[]>(["/api/accounts", account.id, "pets"], (old) => {
        if (!old) return [newPet];
        if (old.find(p => p.id === newPet.id)) return old;
        return [...old, newPet];
      });
      toast({
        title: "New Pet Received!",
        description: `${newPet.name} has joined your collection.`,
      });
    });

    eventSource.addEventListener("petUpdated", (event) => {
      const updatedPet = JSON.parse(event.data) as Pet;
      queryClient.setQueryData<Pet[]>(["/api/accounts", account.id, "pets"], (old) => {
        if (!old) return [updatedPet];
        return old.map(p => p.id === updatedPet.id ? updatedPet : p);
      });
    });

    eventSource.addEventListener("petRemoved", (event) => {
      const { petId } = JSON.parse(event.data);
      queryClient.setQueryData<Pet[]>(["/api/accounts", account.id, "pets"], (old) => {
        if (!old) return [];
        return old.filter(p => p.id !== petId);
      });
      toast({
        title: "Pet Removed",
        description: "A pet has been removed from your collection.",
      });
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [account?.id, toast]);

  const handleFeed = async (food: PetFoodItem) => {
    if (!feedDialog || !account) return;
    
    setIsFeeding(true);
    try {
      const res = await apiRequest("POST", `/api/pets/${feedDialog.id}/feed`, { 
        accountId: account.id,
        foodId: food.id 
      });
      await res.json();
      
      await refetchPets();
      const accountRes = await apiRequest("GET", `/api/accounts/${account.id}`);
      setAccount(await accountRes.json());
      
      toast({
        title: "Pet Fed!",
        description: `Used ${food.name} to add ${food.exp} EXP to ${feedDialog.name}.`,
      });
      setFeedDialog(null);
      setSelectedFood(null);
    } catch (error: any) {
      const errorData = await error.json?.() || { error: "Could not feed pet." };
      toast({
        title: "Feed Failed",
        description: errorData.error || "Could not feed pet.",
        variant: "destructive",
      });
    } finally {
      setIsFeeding(false);
    }
  };

  const handleFeedWithExp = async () => {
    if (!feedDialog || !account || expFeedAmount <= 0) return;
    
    setIsFeeding(true);
    try {
      const res = await apiRequest("POST", `/api/pets/${feedDialog.id}/feed-exp`, { 
        accountId: account.id,
        amount: expFeedAmount
      });
      await res.json();
      
      await refetchPets();
      const accountRes = await apiRequest("GET", `/api/accounts/${account.id}`);
      setAccount(await accountRes.json());
      
      toast({
        title: "Pet Fed!",
        description: `Added ${expFeedAmount.toLocaleString()} EXP to ${feedDialog.name}.`,
      });
      setFeedDialog(null);
      setSelectedFood(null);
      setExpFeedAmount(100);
    } catch (error: any) {
      const errorData = await error.json?.() || { error: "Could not feed pet." };
      toast({
        title: "Feed Failed",
        description: errorData.error || "Could not feed pet.",
        variant: "destructive",
      });
    } finally {
      setIsFeeding(false);
    }
  };

  const handleEvolve = async (pet: Pet) => {
    if (!account) return;
    
    setIsEvolving(true);
    try {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/evolve`);
      const { pet: updatedPet, account: updatedAccount } = await res.json();
      
      await refetchPets();
      setAccount(updatedAccount);
      
      toast({
        title: "Evolution Complete!",
        description: `${pet.name} evolved to ${updatedPet.tier}!`,
      });
    } catch (error: any) {
      const errorData = await error.json?.() || { error: "Could not evolve pet." };
      toast({
        title: "Evolution Failed",
        description: errorData.error,
        variant: "destructive",
      });
    } finally {
      setIsEvolving(false);
    }
  };

  const handleMerge = async () => {
    if (!account || !mergePet1 || !mergePet2) return;
    
    setIsMerging(true);
    try {
      const res = await apiRequest("POST", `/api/accounts/${account.id}/pets/merge`, {
        petId1: mergePet1.id,
        petId2: mergePet2.id,
      });
      const result = await res.json();
      
      await refetchPets();
      const accountRes = await apiRequest("GET", `/api/accounts/${account.id}`);
      setAccount(await accountRes.json());
      
      toast({
        title: "Pets Merged!",
        description: `Created a powerful new egg: ${result.newPet.name}`,
      });
      setMergeDialogOpen(false);
      setMergePet1(null);
      setMergePet2(null);
    } catch (error: any) {
      const errorData = await error.json?.() || { error: "Could not merge pets." };
      toast({
        title: "Merge Failed",
        description: errorData.error,
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  const mythicPets = playerPets.filter(p => p.tier === "mythic");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!account || account.role !== "player") {
    navigate("/");
    return null;
  }

  const renderPetCard = (pet: Pet) => {
    const tier = pet.tier as PetTier;
    const config = petTierConfig[tier];
    const stats = pet.stats as { Str: number; Spd: number; Luck: number; ElementalPower: number };
    const expProgress = config.maxExp ? (pet.exp / config.maxExp) * 100 : 100;
    const canEvolve = config.maxExp !== null && pet.exp >= config.maxExp;

    return (
      <Card key={pet.id} className={`border ${tierColors[tier]}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="text-xl">{tierEmojis[tier]}</span>
              <span className="truncate">{pet.name}</span>
            </span>
            <Badge className={tierColors[tier]} data-testid={`badge-pet-tier-${pet.id}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1 mb-2">
            {((pet as any).elements || [pet.element]).map((elem: string) => (
              <Badge key={elem} variant="outline" className={`text-xs ${elementColors[elem] || 'text-muted-foreground'}`}>
                {elem}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-red-400" />
              <span>STR: {stats.Str}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>SPD: {stats.Spd}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clover className="w-3 h-3 text-green-400" />
              <span>LUCK: {stats.Luck}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>ELEM: {stats.ElementalPower}</span>
            </div>
          </div>

          {config.maxExp !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>EXP</span>
                <span>{pet.exp} / {config.maxExp}</span>
              </div>
              <Progress value={expProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setFeedDialog(pet)}
              disabled={account.gold <= 0 && (account.petExp || 0) <= 0}
              data-testid={`button-feed-${pet.id}`}
            >
              <Heart className="w-3 h-3 mr-1" />
              Feed
            </Button>
            {canEvolve && config.evolutionCost !== null && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600"
                onClick={() => handleEvolve(pet)}
                disabled={isEvolving || account.gold < config.evolutionCost}
                data-testid={`button-evolve-${pet.id}`}
              >
                <ArrowUp className="w-3 h-3 mr-1" />
                Evolve ({config.evolutionCost.toLocaleString()}g)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-pets-title">
                My Pets
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/shop")} data-testid="link-shop">
                  <ShoppingBag className="w-4 h-4 mr-1.5" />Shop
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/skills")} data-testid="link-skills">
                  <Sparkles className="w-4 h-4 mr-1.5" />Skills
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/trading")} data-testid="link-trading">
                  <ArrowLeftRight className="w-4 h-4 mr-1.5" />Trade
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} data-testid="link-inventory">
                  <Package className="w-4 h-4 mr-1.5" />Inventory
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/challenges")} data-testid="link-challenges">
                  <Swords className="w-4 h-4 mr-1.5" />Challenges
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/events")} data-testid="link-events">
                  <Calendar className="w-4 h-4 mr-1.5" />Events
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/npc-battle")} data-testid="link-npc">
                  <Target className="w-4 h-4 mr-1.5" />NPC Tower
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/quests")} data-testid="link-quests">
                  <ScrollText className="w-4 h-4 mr-1.5" />Quests
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} data-testid="link-leaderboard">
                  <Trophy className="w-4 h-4 mr-1.5" />Leaderboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/guild")} data-testid="link-guild">
                  <Target className="w-4 h-4 mr-1.5" />Guild
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate("/skills")} data-testid="link-skills">
                  <Sparkles className="w-4 h-4 mr-1.5" />Skills
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-tier-x/10 text-tier-x border-tier-x/30">
                  <Heart className="w-3 h-3 mr-1" />
                  {account.petExp || 0} Pet EXP
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4 mr-2" />Logout
              </Button>
            </div>
          </div>
          <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto pb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/shop")}>
              <ShoppingBag className="w-4 h-4 mr-1" />Shop
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
              <Package className="w-4 h-4 mr-1" />Inventory
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/challenges")}>
              <Swords className="w-4 h-4 mr-1" />Challenges
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {petsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pets...</p>
          </div>
        ) : playerPets.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You don't have any pets yet.</p>
          </div>
        ) : (
          petTiers.map(tier => {
            const petsInTier = petsByTier[tier];
            if (petsInTier.length === 0) return null;

            return (
              <section key={tier}>
                <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-xl">{tierEmojis[tier]}</span>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} ({petsInTier.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {petsInTier.map(renderPetCard)}
                </div>
              </section>
            );
          })
        )}
      </main>

      {mythicPets.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={() => setMergeDialogOpen(true)}
            className="shadow-lg bg-pink-600 hover:bg-pink-700"
            data-testid="button-open-merge"
          >
            <GitMerge className="w-5 h-5 mr-2" />
            Merge Mythic Pets
          </Button>
        </div>
      )}

      <Dialog open={mergeDialogOpen} onOpenChange={(open) => { 
        setMergeDialogOpen(open); 
        if (!open) { setMergePet1(null); setMergePet2(null); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-pink-500" />
              Merge Mythic Pets
            </DialogTitle>
            <DialogDescription>
              Combine two mythic pets to create a powerful new egg with combined elements and boosted stats.
              Cost: 1,000,000,000 Gold
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-sm font-medium flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Your Gold
              </span>
              <span className={`font-mono font-bold ${account.gold >= 1000000000 ? 'text-green-500' : 'text-red-500'}`}>
                {account.gold.toLocaleString()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">First Mythic Pet</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {mythicPets.filter(p => p.id !== mergePet2?.id).map(pet => (
                    <Button
                      key={pet.id}
                      variant={mergePet1?.id === pet.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMergePet1(pet)}
                      className="justify-start"
                      data-testid={`button-select-pet1-${pet.id}`}
                    >
                      {pet.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Second Mythic Pet</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {mythicPets.filter(p => p.id !== mergePet1?.id).map(pet => (
                    <Button
                      key={pet.id}
                      variant={mergePet2?.id === pet.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMergePet2(pet)}
                      className="justify-start"
                      data-testid={`button-select-pet2-${pet.id}`}
                    >
                      {pet.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {mergePet1 && mergePet2 && (
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <p className="text-sm font-medium text-pink-400 mb-2">Combined Elements:</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(new Set([
                    ...(mergePet1.elements || [mergePet1.element]),
                    ...(mergePet2.elements || [mergePet2.element])
                  ])).map((elem: string) => (
                    <Badge key={elem} variant="outline" className={`text-xs ${elementColors[elem] || ''}`}>
                      {elem}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMergeDialogOpen(false); setMergePet1(null); setMergePet2(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleMerge} 
              disabled={isMerging || !mergePet1 || !mergePet2 || account.gold < 1000000000}
              className="bg-pink-600 hover:bg-pink-700"
              data-testid="button-confirm-merge"
            >
              {isMerging ? "Merging..." : "Merge (1B Gold)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!feedDialog} onOpenChange={() => { setFeedDialog(null); setSelectedFood(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Feed {feedDialog?.name}</DialogTitle>
            <DialogDescription>
              Use your Pet EXP or buy food with gold to increase your pet's experience.
            </DialogDescription>
          </DialogHeader>
          {feedDialog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-sm font-medium">Gold</span>
                  <span className="font-mono font-bold text-yellow-500">{(account.gold || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <span className="text-sm font-medium">Pet EXP</span>
                  <span className="font-mono font-bold text-purple-500">{(account.petExp || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
                <span className="text-sm font-medium text-purple-400">Use Pet EXP</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={account.petExp || 0}
                    value={expFeedAmount}
                    onChange={(e) => setExpFeedAmount(Math.min(Number(e.target.value) || 0, account.petExp || 0))}
                    className="flex-1"
                    data-testid="input-pet-exp-amount"
                  />
                  <Button
                    size="sm"
                    onClick={handleFeedWithExp}
                    disabled={isFeeding || expFeedAmount <= 0 || expFeedAmount > (account.petExp || 0)}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-feed-with-exp"
                  >
                    Feed {expFeedAmount.toLocaleString()} EXP
                  </Button>
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or buy food</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Pet Food Shop</span>
                <div className="grid grid-cols-2 gap-2">
                  {petFoodItems.map((food) => {
                    const canAfford = (account.gold || 0) >= food.price;
                    return (
                      <Card 
                        key={food.id} 
                        className={`cursor-pointer transition-all ${selectedFood?.id === food.id ? 'ring-2 ring-primary' : ''} ${!canAfford ? 'opacity-50' : 'hover-elevate'}`}
                        onClick={() => canAfford && setSelectedFood(food)}
                        data-testid={`card-food-${food.id}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{food.name}</p>
                              <p className="text-xs text-green-500">+{food.exp.toLocaleString()} EXP</p>
                            </div>
                            <Badge variant="outline" className="text-yellow-500">
                              <Coins className="w-3 h-3 mr-1" />
                              {food.price.toLocaleString()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {selectedFood && (
                <div className="text-center text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                  Feed {feedDialog.name} with {selectedFood.name} for {selectedFood.exp.toLocaleString()} EXP
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFeedDialog(null); setSelectedFood(null); }}>Cancel</Button>
            <Button 
              onClick={() => selectedFood && handleFeed(selectedFood)} 
              disabled={isFeeding || !selectedFood}
              data-testid="button-confirm-feed"
            >
              {isFeeding ? "Feeding..." : selectedFood ? `Buy & Feed (${selectedFood.price.toLocaleString()} Gold)` : "Select Food"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
