import { useState } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/lib/game-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sword, Shield, Crown, LogOut, ChevronRight, Target, Trophy, Skull, Sparkles, Cat, Check, ArrowLeftRight } from "lucide-react";

const elementColors: Record<string, string> = {
  Fire: "text-red-500 border-red-500",
  Water: "text-blue-500 border-blue-500",
  Earth: "text-amber-700 border-amber-700",
  Air: "text-sky-400 border-sky-400",
  Lightning: "text-yellow-400 border-yellow-400",
  Ice: "text-cyan-300 border-cyan-300",
  Nature: "text-green-500 border-green-500",
  Dark: "text-purple-800 border-purple-800",
  Light: "text-yellow-100 border-yellow-100",
  Arcana: "text-violet-500 border-violet-500",
  Chrono: "text-amber-400 border-amber-400",
  Plasma: "text-pink-500 border-pink-500",
  Void: "text-gray-600 border-gray-600",
  Aether: "text-indigo-400 border-indigo-400",
  Hybrid: "text-gradient bg-gradient-to-r from-red-500 to-blue-500 border-purple-400",
  "Elemental Convergence": "text-white border-white",
  Time: "text-amber-300 border-amber-300",
  Space: "text-indigo-300 border-indigo-300",
};

export default function NpcBattle() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [battleResult, setBattleResult] = useState<any>(null);
  const [showPetSelect, setShowPetSelect] = useState(false);

  const { data: currentNpc } = useQuery({
    queryKey: ["/api/accounts", account?.id, "current-npc"],
    queryFn: async () => {
      if (!account?.id) return null;
      const res = await fetch(`/api/accounts/${account.id}/current-npc`);
      if (!res.ok) throw new Error("Failed to fetch NPC");
      return res.json();
    },
    enabled: !!account?.id,
  });

  const { data: playerPets } = useQuery({
    queryKey: ["/api/accounts", account?.id, "pets"],
    queryFn: async () => {
      if (!account?.id) return [];
      const res = await fetch(`/api/accounts/${account.id}/pets`);
      if (!res.ok) throw new Error("Failed to fetch pets");
      return res.json();
    },
    enabled: !!account?.id,
  });

  const equipPetMutation = useMutation({
    mutationFn: async (petId: string | null) => {
      const res = await apiRequest("POST", `/api/accounts/${account?.id}/equip-pet`, { petId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "current-npc"] });
      setShowPetSelect(false);
      toast({ title: "Pet equipped", description: "Your pet is ready for battle" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to equip pet", variant: "destructive" });
    },
  });

  const battleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/accounts/${account?.id}/npc-battle`);
      return res.json();
    },
    onSuccess: (result) => {
      setBattleResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "current-npc"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Battle failed", variant: "destructive" });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!account || account.role !== "player") {
    navigate("/");
    return null;
  }

  const globalLevel = currentNpc ? (currentNpc.floor - 1) * 100 + currentNpc.level : 1;
  const levelProgress = currentNpc ? ((currentNpc.level - 1) / 99) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-serif text-primary">NPC Tower</h1>
            <nav className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/shop")} data-testid="link-shop">Shop</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} data-testid="link-inventory">Inventory</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} data-testid="link-pets">Pets</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/challenges")} data-testid="link-challenges">Challenges</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/events")} data-testid="link-events">Events</Button>
              <Button variant="secondary" size="sm" data-testid="link-npc-active">NPC Battle</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/quests")} data-testid="link-quests">Quests</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} data-testid="link-leaderboard">Leaderboard</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/guild")} data-testid="link-guild">Guild</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/skills")} data-testid="link-skills">Skills</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trading")} data-testid="link-trading">Trade</Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{account.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Current Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Floor</span>
                  <Badge variant="outline" className="text-lg">{currentNpc?.floor || 1} / 50</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Level</span>
                  <Badge variant="outline" className="text-lg">{currentNpc?.level || 1} / 100</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Global Level</span>
                  <span className="text-xl font-bold text-primary">{globalLevel.toLocaleString()}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Floor Progress</span>
                    <span>{currentNpc?.level || 1}%</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cat className="w-5 h-5 text-primary" />
                  Equipped Pet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentNpc?.equippedPet ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{currentNpc.equippedPet.name}</span>
                      <Badge>{currentNpc.equippedPet.tier}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentNpc.equippedPet.elements.map((elem: string) => (
                        <Badge key={elem} variant="outline" className={`text-xs ${elementColors[elem] || ''}`}>
                          {elem}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>STR: {(currentNpc.equippedPet.stats as any)?.Str || 0}</div>
                      <div>SPD: {(currentNpc.equippedPet.stats as any)?.Spd || 0}</div>
                      <div>LUCK: {(currentNpc.equippedPet.stats as any)?.Luck || 0}</div>
                      <div>ELEM: {(currentNpc.equippedPet.stats as any)?.ElementalPower || 0}</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setShowPetSelect(true)} data-testid="button-change-pet">
                      Change Pet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-3">No pet equipped</p>
                    <Button onClick={() => setShowPetSelect(true)} data-testid="button-equip-pet">
                      <Cat className="w-4 h-4 mr-2" />
                      Equip Pet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentNpc?.isBoss ? (
                  <>
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <span className="text-yellow-500">{currentNpc?.name || "Floor Boss"}</span>
                  </>
                ) : (
                  <>
                    <Skull className="w-6 h-6 text-muted-foreground" />
                    <span>{currentNpc?.name || "Loading..."}</span>
                  </>
                )}
              </CardTitle>
              {currentNpc?.isBoss && currentNpc.bossAbility && (
                <CardDescription className="text-yellow-500/80">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  {currentNpc.bossAbility.name}: {currentNpc.bossAbility.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-muted-foreground text-sm">Power</div>
                  <div className="text-2xl font-bold text-red-500">
                    {currentNpc?.power?.toLocaleString() || "?"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Floor Range</div>
                  <div className="text-sm">
                    {currentNpc?.powerRange?.min.toLocaleString()} - {currentNpc?.powerRange?.max.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Type</div>
                  <Badge variant={currentNpc?.isBoss ? "default" : "secondary"}>
                    {currentNpc?.isBoss ? "BOSS" : "Normal"}
                  </Badge>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Immunities</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {currentNpc?.immuneElements?.length > 0 ? (
                      currentNpc.immuneElements.map((elem: string) => (
                        <Badge key={elem} variant="destructive" className="text-xs">
                          {elem}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>

              {currentNpc?.immuneElements?.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm">
                  <Shield className="w-4 h-4 inline mr-2 text-destructive" />
                  This NPC is immune to {currentNpc.immuneElements.join(", ")} elements. 
                  Your pet's elemental power won't count if it has any of these elements.
                </div>
              )}

              {currentNpc?.potentialRewards && (
                <div className="bg-primary/10 border border-primary/30 rounded-md p-3">
                  <div className="text-sm font-semibold mb-2">Victory Rewards:</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">Gold:</span>
                      <span className="font-mono">{currentNpc.potentialRewards.gold.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">TP:</span>
                      <span className="font-mono">{currentNpc.potentialRewards.trainingPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400">Shards:</span>
                      <span className="font-mono">{currentNpc.potentialRewards.soulShards.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">Pet Exp:</span>
                      <span className="font-mono">{currentNpc.potentialRewards.petExp.toLocaleString()}</span>
                    </div>
                    {currentNpc.potentialRewards.runes > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-red-400">Runes:</span>
                        <span className="font-mono">{currentNpc.potentialRewards.runes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentNpc?.requiredRank && !currentNpc?.canFight && (
                <div className="bg-destructive/20 border border-destructive/50 rounded-md p-3 text-center">
                  <div className="font-semibold text-destructive">Rank Too Low</div>
                  <p className="text-sm text-muted-foreground">
                    You need <span className="font-bold text-foreground">{currentNpc.requiredRank}</span> rank 
                    to fight level {globalLevel}+. Your current rank: {currentNpc.playerRank}
                  </p>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => battleMutation.mutate()}
                disabled={battleMutation.isPending || !currentNpc?.canFight}
                data-testid="button-battle"
              >
                {battleMutation.isPending ? (
                  "Fighting..."
                ) : !currentNpc?.canFight ? (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Rank Required: {currentNpc?.requiredRank}
                  </>
                ) : (
                  <>
                    <Sword className="w-5 h-5 mr-2" />
                    Challenge {currentNpc?.isBoss ? "Boss" : "NPC"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tower Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>50 Floors</strong> - Each floor has 100 NPC levels plus a boss at level 100</p>
                <p><strong>Power Scaling</strong> - NPCs get exponentially stronger on higher floors</p>
                <p><strong>Boss Fights</strong> - Bosses have max stats and special abilities</p>
                <p><strong>Elemental Immunity</strong> - Floor 2+ NPCs are immune to certain elements</p>
                <p><strong>Rewards</strong> - Earn gold, pet exp, and runes (bosses only) from victories</p>
                <p className="text-xs opacity-60">Note: NPC battles do not affect your win/loss record</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showPetSelect} onOpenChange={setShowPetSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Pet for Battle</DialogTitle>
            <DialogDescription>Choose a pet to help you in NPC battles</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => equipPetMutation.mutate(null)}
              data-testid="button-unequip-pet"
            >
              <span className="text-muted-foreground">No Pet</span>
            </Button>
            {playerPets?.map((pet: any) => {
              const isEquipped = currentNpc?.equippedPet?.id === pet.id;
              const elements = pet.elements || [pet.element];
              return (
                <Button
                  key={pet.id}
                  variant={isEquipped ? "secondary" : "outline"}
                  className="w-full justify-between"
                  onClick={() => equipPetMutation.mutate(pet.id)}
                  data-testid={`button-select-pet-${pet.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{pet.name}</span>
                    <Badge variant="outline">{pet.tier}</Badge>
                    {elements.map((elem: string) => (
                      <Badge key={elem} variant="outline" className={`text-xs ${elementColors[elem] || ''}`}>
                        {elem}
                      </Badge>
                    ))}
                  </div>
                  {isEquipped && <Check className="w-4 h-4 text-green-500" />}
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!battleResult} onOpenChange={() => setBattleResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={battleResult?.won ? "text-green-500" : "text-red-500"}>
              {battleResult?.won ? (
                <>
                  <Trophy className="w-6 h-6 inline mr-2" />
                  Victory!
                </>
              ) : (
                <>
                  <Skull className="w-6 h-6 inline mr-2" />
                  Defeated
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-lg">
              vs {battleResult?.npcName}
              {battleResult?.isBoss && <Badge className="ml-2 bg-yellow-500">BOSS</Badge>}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Your Power</div>
                <div className="text-xl font-bold text-green-500">{battleResult?.playerPower?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">NPC Power</div>
                <div className="text-xl font-bold text-red-500">{battleResult?.npcPower?.toLocaleString()}</div>
              </div>
            </div>

            {battleResult?.equippedPet && (
              <div className="bg-muted/50 rounded-md p-3 text-sm">
                <div className="font-semibold mb-1">Pet: {battleResult.equippedPet.name}</div>
                <div className="text-muted-foreground">
                  Elements: {battleResult.equippedPet.elements.join(", ")}
                </div>
                {battleResult.petElementImmune && (
                  <div className="text-destructive mt-1">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Pet's elemental power was blocked by immunity
                  </div>
                )}
              </div>
            )}

            {battleResult?.won && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <div className="font-semibold text-green-500 mb-2">Rewards Collected!</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {battleResult.rewards.gold > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">Gold:</span> +{battleResult.rewards.gold.toLocaleString()}
                    </div>
                  )}
                  {battleResult.rewards.trainingPoints > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400">TP:</span> +{battleResult.rewards.trainingPoints.toLocaleString()}
                    </div>
                  )}
                  {battleResult.rewards.soulShards > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400">Soul Shards:</span> +{battleResult.rewards.soulShards.toLocaleString()}
                    </div>
                  )}
                  {battleResult.rewards.petExp > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">Pet Exp:</span> +{battleResult.rewards.petExp.toLocaleString()}
                    </div>
                  )}
                  {battleResult.rewards.runes > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-red-400">Runes:</span> +{battleResult.rewards.runes.toLocaleString()}
                    </div>
                  )}
                </div>
                {battleResult.newFloor > battleResult.floor && (
                  <div className="mt-2 text-green-500 font-semibold">
                    <ChevronRight className="w-4 h-4 inline" />
                    Advanced to Floor {battleResult.newFloor}!
                  </div>
                )}
              </div>
            )}

            <Button className="w-full" onClick={() => setBattleResult(null)} data-testid="button-close-result">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
