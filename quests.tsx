import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useGame } from "@/lib/game-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, 
  Package, 
  LogOut, 
  Calendar, 
  Swords, 
  Target,
  Trophy,
  ScrollText,
  CheckCircle2,
  Clock,
  Gift,
  Coins,
  Lock,
  Shield,
  ArrowLeftRight,
} from "lucide-react";
import type { QuestRewards, Quest } from "@shared/schema";

type QuestAssignment = {
  id: string;
  questId: string;
  accountId: string;
  status: string;
  acceptedAt: string | null;
  completedAt: string | null;
  rewardedAt: string | null;
  quest: Quest;
};

type QuestWithAssignments = Quest & {
  assignments?: { accountId: string; status: string; playerName?: string }[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  accepted: "bg-blue-500/20 text-blue-500",
  completed: "bg-green-500/20 text-green-500",
  rewarded: "bg-purple-500/20 text-purple-500",
};

const statusLabels: Record<string, string> = {
  pending: "New Quest",
  accepted: "In Progress",
  completed: "Completed",
  rewarded: "Rewards Claimed",
};

const RewardsList = ({ rewards }: { rewards: QuestRewards }) => {
  const rewardItems = [];
  if (rewards.gold) rewardItems.push({ label: "Gold", value: rewards.gold, icon: Coins, color: "text-yellow-500" });
  if (rewards.rubies) rewardItems.push({ label: "Rubies", value: rewards.rubies, icon: Gift, color: "text-red-500" });
  if (rewards.soulShards) rewardItems.push({ label: "Soul Shards", value: rewards.soulShards, icon: Gift, color: "text-purple-500" });
  if (rewards.focusedShards) rewardItems.push({ label: "Focused Shards", value: rewards.focusedShards, icon: Gift, color: "text-blue-500" });
  if (rewards.trainingPoints) rewardItems.push({ label: "Training Points", value: rewards.trainingPoints, icon: Gift, color: "text-green-500" });
  if (rewards.runes) rewardItems.push({ label: "Runes", value: rewards.runes, icon: Gift, color: "text-orange-500" });
  if (rewards.petExp) rewardItems.push({ label: "Pet Exp", value: rewards.petExp, icon: Gift, color: "text-pink-500" });

  if (rewardItems.length === 0) {
    return <span className="text-muted-foreground">No rewards specified</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {rewardItems.map((item, idx) => (
        <Badge key={idx} variant="outline" className="flex items-center gap-1">
          <item.icon className={`h-3 w-3 ${item.color}`} />
          {item.value.toLocaleString()} {item.label}
        </Badge>
      ))}
    </div>
  );
};

export default function Quests() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const { toast } = useToast();

  const { data: allQuests = [], isLoading: questsLoading } = useQuery<QuestWithAssignments[]>({
    queryKey: ["/api/quests"],
    enabled: !!account,
  });

  const { data: myAssignments = [], isLoading: assignmentsLoading } = useQuery<QuestAssignment[]>({
    queryKey: ["/api/accounts", account?.id, "quests"],
    enabled: !!account,
  });

  const acceptMutation = useMutation({
    mutationFn: async (questId: string) => {
      return apiRequest("POST", `/api/accounts/${account?.id}/quests/${questId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quests"] });
      toast({
        title: "Quest Accepted!",
        description: "You've accepted the quest. Good luck!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept quest",
        description: error?.message || "This quest may already be taken.",
        variant: "destructive",
      });
    },
  });

  if (!account) {
    navigate("/");
    return null;
  }

  const isLoading = questsLoading || assignmentsLoading;

  const myQuestIds = new Set(myAssignments.map(a => a.questId));
  
  const availableQuests = allQuests.filter(q => {
    const hasAssignments = q.assignments && q.assignments.length > 0;
    const isMine = myQuestIds.has(q.id);
    return !hasAssignments && !isMine;
  });
  
  const takenByOthers = allQuests.filter(q => {
    const hasAssignments = q.assignments && q.assignments.length > 0;
    const isMine = myQuestIds.has(q.id);
    return hasAssignments && !isMine;
  });

  const activeQuests = myAssignments.filter(q => q.status === "accepted");
  const completedQuests = myAssignments.filter(q => ["completed", "rewarded"].includes(q.status));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-cinzel text-2xl font-bold text-foreground flex items-center gap-2">
                <ScrollText className="h-6 w-6 text-amber-500" />
                Quests
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/shop")}
                data-testid="link-shop"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                Shop
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/inventory")}
                data-testid="link-inventory"
              >
                <Package className="h-4 w-4 mr-1" />
                Inventory
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/events")}
                data-testid="link-events"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Events
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/challenges")}
                data-testid="link-challenges"
              >
                <Swords className="h-4 w-4 mr-1" />
                Challenges
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/npc-battle")}
                data-testid="link-npc-battle"
              >
                <Target className="h-4 w-4 mr-1" />
                NPC Tower
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/leaderboard")}
                data-testid="link-leaderboard"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Leaderboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/guild")}
                data-testid="link-guild"
              >
                <Shield className="h-4 w-4 mr-1" />
                Guild
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/trading")}
                data-testid="link-trading"
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Trade
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {availableQuests.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    Available Quests ({availableQuests.length})
                  </h2>
                  <div className="space-y-4">
                    {availableQuests.map((quest) => (
                      <Card key={quest.id} className="border-yellow-500/30" data-testid={`quest-available-${quest.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{quest.title}</CardTitle>
                              <CardDescription>{quest.description}</CardDescription>
                            </div>
                            <Badge className="bg-green-500/20 text-green-500">
                              Available
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Rewards:</span>
                            <RewardsList rewards={quest.rewards} />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => acceptMutation.mutate(quest.id)}
                            disabled={acceptMutation.isPending}
                            data-testid={`button-accept-${quest.id}`}
                          >
                            Accept Quest
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {takenByOthers.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    Taken by Others ({takenByOthers.length})
                  </h2>
                  <div className="space-y-4">
                    {takenByOthers.map((quest) => (
                      <Card key={quest.id} className="border-muted opacity-60" data-testid={`quest-taken-${quest.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-muted-foreground">{quest.title}</CardTitle>
                              <CardDescription>{quest.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">
                              Taken
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Rewards:</span>
                            <RewardsList rewards={quest.rewards} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {activeQuests.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-blue-500" />
                    My Active Quests ({activeQuests.length})
                  </h2>
                  <div className="space-y-4">
                    {activeQuests.map((assignment) => (
                      <Card key={assignment.id} className="border-blue-500/30" data-testid={`quest-active-${assignment.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{assignment.quest.title}</CardTitle>
                              <CardDescription>{assignment.quest.description}</CardDescription>
                            </div>
                            <Badge className={statusColors[assignment.status]}>
                              {statusLabels[assignment.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Rewards on completion:</span>
                            <RewardsList rewards={assignment.quest.rewards} />
                          </div>
                        </CardContent>
                        <CardFooter className="text-sm text-muted-foreground">
                          Waiting for admin to mark as complete...
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {completedQuests.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Completed Quests ({completedQuests.length})
                  </h2>
                  <div className="space-y-4">
                    {completedQuests.map((assignment) => (
                      <Card key={assignment.id} className="border-green-500/30 opacity-75" data-testid={`quest-completed-${assignment.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{assignment.quest.title}</CardTitle>
                              <CardDescription>{assignment.quest.description}</CardDescription>
                            </div>
                            <Badge className={statusColors[assignment.status]}>
                              {statusLabels[assignment.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Rewards received:</span>
                            <RewardsList rewards={assignment.quest.rewards} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {allQuests.length === 0 && myAssignments.length === 0 && (
                <div className="text-center py-16">
                  <ScrollText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Quests Available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new quests from the admins!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
