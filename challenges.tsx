import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Challenge, Account } from "@shared/schema";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Swords, Package, ShoppingBag, LogOut, Calendar, Check, X, Clock, Trophy, User, ArrowLeft, Heart, Target, ScrollText, ArrowLeftRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ChallengeWithNames extends Challenge {
  challengerName: string;
  challengedName: string;
  winnerName: string | null;
  challengerOnline: boolean;
  challengedOnline: boolean;
}

export default function Challenges() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const { toast } = useToast();
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);

  const { data: challenges = [], isLoading: challengesLoading } = useQuery<ChallengeWithNames[]>({
    queryKey: ["/api/challenges", account?.id],
    queryFn: async () => {
      if (!account?.id) return [];
      const res = await fetch(`/api/challenges?accountId=${account.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return res.json();
    },
    enabled: !!account?.id,
  });

  const { data: allPlayers = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const otherPlayers = useMemo(() => {
    return allPlayers.filter(p => p.id !== account?.id);
  }, [allPlayers, account?.id]);

  const pendingReceived = challenges.filter(
    c => c.challengedId === account?.id && c.status === "pending"
  );
  const pendingSent = challenges.filter(
    c => c.challengerId === account?.id && c.status === "pending"
  );
  const activeChallenges = challenges.filter(c => c.status === "accepted");
  const completedChallenges = challenges.filter(c => c.status === "completed");

  const handleChallenge = async (targetId: string) => {
    if (!account) return;

    try {
      await apiRequest("POST", "/api/challenges", {
        challengerId: account.id,
        challengedId: targetId,
      });

      toast({
        title: "Challenge Sent!",
        description: "Your challenge has been sent to the player.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
      setChallengeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Challenge failed",
        description: "Could not send the challenge.",
        variant: "destructive",
      });
    }
  };

  const handleAccept = async (challengeId: string) => {
    if (!account) return;
    try {
      await apiRequest("PATCH", `/api/challenges/${challengeId}/accept`);

      toast({
        title: "Challenge Accepted!",
        description: "The challenge has been accepted. Awaiting admin to select winner.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
    } catch (error) {
      toast({
        title: "Failed to accept",
        description: "Could not accept the challenge.",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (challengeId: string) => {
    if (!account) return;
    try {
      await apiRequest("PATCH", `/api/challenges/${challengeId}/decline`);

      toast({
        title: "Challenge Declined",
        description: "You have declined the challenge.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
    } catch (error) {
      toast({
        title: "Failed to decline",
        description: "Could not decline the challenge.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (challengeId: string) => {
    if (!account) return;
    try {
      await apiRequest("PATCH", `/api/challenges/${challengeId}/cancel`);

      toast({
        title: "Challenge Cancelled",
        description: "Your challenge has been cancelled.",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/challenges", account.id] });
    } catch (error) {
      toast({
        title: "Failed to cancel",
        description: "Could not cancel the challenge.",
        variant: "destructive",
      });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "accepted":
        return <Badge className="bg-yellow-600"><Swords className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-600"><Trophy className="w-3 h-3 mr-1" />Completed</Badge>;
      case "declined":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Declined</Badge>;
      case "cancelled":
        return <Badge variant="outline"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/shop")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-challenges-title">
                Challenges
              </h1>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/shop")}
                  data-testid="button-nav-shop"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/inventory")}
                  data-testid="button-nav-inventory"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Inventory
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/events")}
                  data-testid="button-nav-events"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/npc-battle")}
                  data-testid="button-nav-npc"
                >
                  <Target className="w-4 h-4 mr-2" />
                  NPC Tower
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/quests")}
                  data-testid="button-nav-quests"
                >
                  <ScrollText className="w-4 h-4 mr-2" />
                  Quests
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/leaderboard")}
                  data-testid="button-nav-leaderboard"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/guild")}
                  data-testid="button-nav-guild"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Guild
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/trading")}
                  data-testid="link-trading"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Trade
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">W: {account.wins}</span>
                <span className="text-muted-foreground">L: {account.losses}</span>
              </div>
              <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-new-challenge">
                    <Swords className="w-4 h-4 mr-2" />
                    New Challenge
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Challenge a Player</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {otherPlayers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No other players available</p>
                    ) : (
                      otherPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{player.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {player.wins}W - {player.losses}L
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleChallenge(player.id)}
                            data-testid={`button-challenge-${player.id}`}
                          >
                            <Swords className="w-4 h-4 mr-1" />
                            Challenge
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/pets")}>
              <Heart className="w-4 h-4 mr-1" />Pets
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
              <Calendar className="w-4 h-4 mr-1" />Events
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {challengesLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading challenges...</p>
          </div>
        ) : (
          <>
            {pendingReceived.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-primary" />
                  Incoming Challenges ({pendingReceived.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingReceived.map((challenge) => (
                    <Card key={challenge.id} className="border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${challenge.challengerOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                            <span className="truncate">{challenge.challengerName}</span>
                          </div>
                          {getStatusBadge(challenge.status)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Challenged you on {new Date(challenge.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(challenge.id)}
                            data-testid={`button-accept-${challenge.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDecline(challenge.id)}
                            data-testid={`button-decline-${challenge.id}`}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {pendingSent.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Sent Challenges ({pendingSent.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingSent.map((challenge) => (
                    <Card key={challenge.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${challenge.challengedOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                            <span className="truncate">{challenge.challengedName}</span>
                          </div>
                          {getStatusBadge(challenge.status)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Waiting for response...
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancel(challenge.id)}
                          data-testid={`button-cancel-${challenge.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {activeChallenges.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-yellow-500" />
                  Active Challenges ({activeChallenges.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeChallenges.map((challenge) => {
                    const isChallenger = challenge.challengerId === account.id;
                    const opponent = isChallenger ? challenge.challengedName : challenge.challengerName;
                    const opponentOnline = isChallenger ? challenge.challengedOnline : challenge.challengerOnline;
                    return (
                      <Card key={challenge.id} className="border-yellow-500/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${opponentOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                              <span className="truncate">vs {opponent}</span>
                            </div>
                            {getStatusBadge(challenge.status)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${challenge.challengerOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                              {challenge.challengerName}
                            </span>
                            <span>vs</span>
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${challenge.challengedOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                              {challenge.challengedName}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Awaiting admin to decide winner
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Accepted: {new Date(challenge.acceptedAt!).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {completedChallenges.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-500" />
                  Completed Challenges ({completedChallenges.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedChallenges.map((challenge) => {
                    const isWinner = challenge.winnerId === account.id;
                    const opponent = challenge.challengerId === account.id
                      ? challenge.challengedName
                      : challenge.challengerName;
                    return (
                      <Card key={challenge.id} className={isWinner ? "border-green-500/50" : "border-red-500/50"}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center justify-between gap-2">
                            <span className="truncate">vs {opponent}</span>
                            <Badge className={isWinner ? "bg-green-600" : "bg-red-600"}>
                              {isWinner ? "Won" : "Lost"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Winner: {challenge.winnerName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {challenge.completedAt ? new Date(challenge.completedAt).toLocaleDateString() : "N/A"}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {challenges.length === 0 && (
              <div className="text-center py-12">
                <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">No Challenges Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Challenge other players to compete and earn wins!
                </p>
                <Button onClick={() => setChallengeDialogOpen(true)} data-testid="button-first-challenge">
                  <Swords className="w-4 h-4 mr-2" />
                  Send Your First Challenge
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
