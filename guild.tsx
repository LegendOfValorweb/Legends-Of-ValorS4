import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Guild, GuildBank, Account } from "@shared/schema";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, Crown, LogOut, ShoppingBag, Package, Swords, Calendar,
  Target, ScrollText, Trophy, Heart, Coins, Gem, Sparkles, Plus, X, 
  UserPlus, Building2, Vault, Castle, ArrowLeftRight
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GuildMember {
  accountId: string;
  username: string;
  rank: string;
  isOnline: boolean;
  isMaster: boolean;
}

interface GuildWithMembers extends Guild {
  members: GuildMember[];
}

interface AvailablePlayer {
  id: string;
  username: string;
  rank: string;
  isOnline: boolean;
}

interface GuildInvite {
  id: string;
  guildId: string;
  guild?: Guild;
}

interface DungeonInfo {
  floor: number;
  level: number;
  displayFloor: number;
  globalLevel: number;
  dungeonName: string;
  isDemonLordDungeon: boolean;
  petsAllowed: boolean;
  isBoss: boolean;
  npcStats: { Str: number; Spd: number; Int: number; Luck: number };
  immunities: string[];
  rewards: { gold: number; rubies: number; soulShards: number; focusedShards: number; runes: number };
  onlineMembers: { accountId: string; username: string; equippedPet?: { id: string; name: string; tier: string; elements: string[] } | null }[];
  memberCount: number;
}

interface GuildBattle {
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
  winnerId?: string;
  createdAt: string;
}

export default function GuildPage() {
  const { account, logout } = useGame();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [guildName, setGuildName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [distributeDialogOpen, setDistributeDialogOpen] = useState(false);
  const [distributions, setDistributions] = useState<Record<string, { gold: number; rubies: number; soulShards: number; focusedShards: number }>>({});
  const [battleDialogOpen, setBattleDialogOpen] = useState(false);
  const [selectedOpponentGuild, setSelectedOpponentGuild] = useState("");
  const [selectedFighters, setSelectedFighters] = useState<string[]>([]);
  const [respondBattleId, setRespondBattleId] = useState<string | null>(null);
  const [respondFighters, setRespondFighters] = useState<string[]>([]);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositResource, setDepositResource] = useState<"gold" | "rubies" | "soulShards" | "focusedShards">("gold");

  const { data: guild, isLoading: guildLoading } = useQuery<GuildWithMembers | null>({
    queryKey: ["/api/accounts", account?.id, "guild"],
    enabled: !!account,
  });

  const { data: invites = [] } = useQuery<GuildInvite[]>({
    queryKey: ["/api/accounts", account?.id, "guild-invites"],
    enabled: !!account && !guild,
  });

  const { data: availablePlayers = [] } = useQuery<AvailablePlayer[]>({
    queryKey: ["/api/players/available-for-guild"],
    enabled: !!account && !!guild && guild.masterId === account.id,
  });

  const { data: dungeonInfo } = useQuery<DungeonInfo>({
    queryKey: ["/api/guilds", guild?.id, "dungeon"],
    enabled: !!guild,
    refetchInterval: 5000,
  });

  const createGuildMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/guilds", { name, masterId: account!.id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      setCreateDialogOpen(false);
      setGuildName("");
      toast({ title: "Guild created!", description: "You are now the Guild Master." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create guild", variant: "destructive" });
    },
  });

  const invitePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/invite`, {
        accountId: playerId,
        invitedBy: account!.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players/available-for-guild"] });
      toast({ title: "Invite sent!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send invite", variant: "destructive" });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await apiRequest("POST", `/api/guild-invites/${inviteId}/accept`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild-invites"] });
      toast({ title: "Joined guild!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to join guild", variant: "destructive" });
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await apiRequest("POST", `/api/guild-invites/${inviteId}/decline`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild-invites"] });
    },
  });

  const leaveGuildMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/leave`, { accountId: account!.id });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      toast({ 
        title: data.guildDisbanded ? "Guild disbanded" : "Left guild",
        description: data.guildDisbanded ? "The guild has been disbanded." : "You have left the guild."
      });
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/kick`, {
        accountId: memberId,
        masterId: account!.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      toast({ title: "Member kicked" });
    },
  });

  const fightDungeonMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/dungeon/fight`, { accountId: account!.id });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guild?.id, "dungeon"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      if (data.victory) {
        toast({ 
          title: "Victory!", 
          description: `Earned ${data.rewards.gold.toLocaleString()} gold for guild bank!` 
        });
      } else {
        toast({ title: "Defeat", description: "The dungeon monsters were too strong.", variant: "destructive" });
      }
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async (dists: { accountId: string; gold: number; rubies: number; soulShards: number; focusedShards: number }[]) => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/distribute`, {
        masterId: account!.id,
        distributions: dists,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      setDistributeDialogOpen(false);
      setDistributions({});
      toast({ title: "Rewards distributed!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to distribute", variant: "destructive" });
    },
  });

  const isMaster = guild?.masterId === account?.id;

  // Guild Battles
  const { data: guildBattles = [] } = useQuery<GuildBattle[]>({
    queryKey: ["/api/guilds", guild?.id, "battles"],
    enabled: !!guild,
  });

  const { data: allGuilds = [] } = useQuery<Guild[]>({
    queryKey: ["/api/guilds"],
    enabled: !!guild && isMaster && battleDialogOpen,
    refetchInterval: battleDialogOpen ? 5000 : false,
  });

  const challengeGuildMutation = useMutation({
    mutationFn: async (data: { challengedGuildId: string; fighters: string[] }) => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/battles/challenge`, {
        accountId: account!.id,
        targetGuildId: data.challengedGuildId,
        fighters: data.fighters,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guild?.id, "battles"] });
      setBattleDialogOpen(false);
      setSelectedOpponentGuild("");
      setSelectedFighters([]);
      toast({ title: "Challenge sent!", description: "Waiting for the opposing guild to respond." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to send challenge", variant: "destructive" });
    },
  });

  const respondBattleMutation = useMutation({
    mutationFn: async (data: { battleId: string; accept: boolean; fighters?: string[] }) => {
      const res = await apiRequest("PATCH", `/api/guild-battles/${data.battleId}/respond`, {
        accountId: account!.id,
        accept: data.accept,
        fighters: data.fighters,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/guilds", guild?.id, "battles"] });
      setRespondBattleId(null);
      setRespondFighters([]);
      toast({ 
        title: variables.accept ? "Challenge accepted!" : "Challenge declined",
        description: variables.accept ? "The battle has begun! Admin will judge each round." : "You declined the guild battle."
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to respond", variant: "destructive" });
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (data: { resource: string; amount: number }) => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/deposit`, {
        accountId: account!.id,
        resource: data.resource,
        amount: data.amount,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id] });
      setDepositDialogOpen(false);
      setDepositAmount("");
      toast({ title: "Deposit successful!", description: "Your contribution has been added to the guild bank." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to deposit", variant: "destructive" });
    },
  });

  const levelUpGuildMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/guilds/${guild!.id}/level-up`, {
        accountId: account!.id,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account?.id, "guild"] });
      toast({ title: "Guild Leveled Up!", description: `Your guild is now level ${data.newLevel}!` });
    },
    onError: (error: any) => {
      toast({ title: "Level Up Failed", description: error.message || "Cannot level up guild", variant: "destructive" });
    },
  });

  const pendingBattles = guildBattles.filter(b => b.status === "pending" && b.challengedGuildId === guild?.id);
  const activeBattles = guildBattles.filter(b => b.status === "accepted" || b.status === "in_progress");
  const completedBattles = guildBattles.filter(b => b.status === "completed").slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!account || account.role !== "player") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold font-serif text-primary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Guild
            </h1>
            <nav className="hidden md:flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/shop")} data-testid="link-shop">
                <ShoppingBag className="w-4 h-4 mr-1" />Shop
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} data-testid="link-inventory">
                <Package className="w-4 h-4 mr-1" />Inventory
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/pets")} data-testid="link-pets">
                <Heart className="w-4 h-4 mr-1" />Pets
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/challenges")} data-testid="link-challenges">
                <Swords className="w-4 h-4 mr-1" />Challenges
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/npc-battle")} data-testid="link-npc">
                <Target className="w-4 h-4 mr-1" />NPC Tower
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/quests")} data-testid="link-quests">
                <ScrollText className="w-4 h-4 mr-1" />Quests
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} data-testid="link-leaderboard">
                <Trophy className="w-4 h-4 mr-1" />Leaderboard
              </Button>
              <Button variant="secondary" size="sm" data-testid="link-guild-active">
                <Shield className="w-4 h-4 mr-1" />Guild
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/skills")} data-testid="link-skills">
                <Sparkles className="w-4 h-4 mr-1" />Skills
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/trading")} data-testid="link-trading">
                <ArrowLeftRight className="w-4 h-4 mr-1" />Trade
              </Button>
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
        {guildLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : !guild ? (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">Join or Create a Guild</CardTitle>
                <CardDescription>
                  Form a party of up to 4 players to conquer the Great Dungeon together!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full" data-testid="button-create-guild">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Guild
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Guild</DialogTitle>
                      <DialogDescription>
                        Choose a name for your guild. You will become the Guild Master.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="guild-name">Guild Name</Label>
                        <Input
                          id="guild-name"
                          value={guildName}
                          onChange={(e) => setGuildName(e.target.value)}
                          placeholder="Enter guild name..."
                          maxLength={30}
                          data-testid="input-guild-name"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => createGuildMutation.mutate(guildName)}
                        disabled={guildName.length < 3 || createGuildMutation.isPending}
                        data-testid="button-confirm-create"
                      >
                        {createGuildMutation.isPending ? "Creating..." : "Create Guild"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {invites.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Pending Invites</h3>
                    <div className="space-y-2">
                      {invites.map((invite) => (
                        <Card key={invite.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{invite.guild?.name || "Unknown Guild"}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => acceptInviteMutation.mutate(invite.id)}
                                disabled={acceptInviteMutation.isPending}
                                data-testid={`button-accept-invite-${invite.id}`}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => declineInviteMutation.mutate(invite.id)}
                                data-testid={`button-decline-invite-${invite.id}`}
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {guild.name}
                  <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">
                    Level {guild.level || 1}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>{guild.members.length}/4 Members</span>
                  {isMaster && (guild.level || 1) < 10 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => levelUpGuildMutation.mutate()}
                      disabled={levelUpGuildMutation.isPending}
                      data-testid="button-level-up-guild"
                      className="text-yellow-500 border-yellow-500/50"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {levelUpGuildMutation.isPending ? "..." : "Level Up"}
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {guild.members.map((member) => (
                    <div
                      key={member.accountId}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {member.isMaster && <Crown className="w-4 h-4 text-yellow-500" />}
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {member.username}
                            {member.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.rank}</p>
                        </div>
                      </div>
                      {isMaster && !member.isMaster && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => kickMemberMutation.mutate(member.accountId)}
                          data-testid={`button-kick-${member.accountId}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {isMaster && guild.members.length < 4 && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" data-testid="button-invite">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Player
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Player</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {availablePlayers.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No available players</p>
                          ) : (
                            availablePlayers.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{player.username}</span>
                                  {player.isOnline && (
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                  )}
                                  <Badge variant="outline">{player.rank}</Badge>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    invitePlayerMutation.mutate(player.id);
                                    setInviteDialogOpen(false);
                                  }}
                                  data-testid={`button-invite-${player.id}`}
                                >
                                  Invite
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => leaveGuildMutation.mutate()}
                    data-testid="button-leave-guild"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isMaster ? "Disband Guild" : "Leave Guild"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vault className="w-5 h-5 text-yellow-500" />
                  Guild Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gold</p>
                      <p className="font-bold">{guild.bank.gold.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10">
                    <Gem className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Rubies</p>
                      <p className="font-bold">{guild.bank.rubies.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Soul Shards</p>
                      <p className="font-bold">{guild.bank.soulShards.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Focused Shards</p>
                      <p className="font-bold">{guild.bank.focusedShards.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Training Points</p>
                      <p className="font-bold">{(guild.bank.trainingPoints || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Runes</p>
                      <p className="font-bold">{(guild.bank.runes || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1" variant="outline" data-testid="button-deposit">
                        <Plus className="w-4 h-4 mr-2" />
                        Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deposit to Guild Bank</DialogTitle>
                        <DialogDescription>
                          Contribute your resources to help the guild
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Resource Type</Label>
                          <Select value={depositResource} onValueChange={(v) => setDepositResource(v as any)}>
                            <SelectTrigger data-testid="select-deposit-resource">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gold">Gold ({account.gold?.toLocaleString() || 0})</SelectItem>
                              <SelectItem value="rubies">Rubies ({account.rubies?.toLocaleString() || 0})</SelectItem>
                              <SelectItem value="soulShards">Soul Shards ({account.soulShards?.toLocaleString() || 0})</SelectItem>
                              <SelectItem value="focusedShards">Focused Shards ({account.focusedShards?.toLocaleString() || 0})</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            min={1}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="Enter amount"
                            data-testid="input-deposit-amount"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDepositDialogOpen(false)}>Cancel</Button>
                        <Button
                          onClick={() => {
                            const amount = parseInt(depositAmount) || 0;
                            if (amount > 0) {
                              depositMutation.mutate({ resource: depositResource, amount });
                            }
                          }}
                          disabled={depositMutation.isPending || !depositAmount}
                          data-testid="button-confirm-deposit"
                        >
                          {depositMutation.isPending ? "Depositing..." : "Deposit"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {isMaster && (
                    <Dialog open={distributeDialogOpen} onOpenChange={setDistributeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex-1" variant="outline" data-testid="button-distribute">
                          <Coins className="w-4 h-4 mr-2" />
                          Distribute
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Distribute Guild Bank</DialogTitle>
                          <DialogDescription>
                            Allocate resources to guild members
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                          {guild.members.map((member) => (
                            <div key={member.accountId} className="space-y-2 p-3 rounded-lg border">
                              <p className="font-medium">{member.username}</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Gold ({guild.bank.gold.toLocaleString()} available)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={guild.bank.gold}
                                    value={distributions[member.accountId]?.gold || 0}
                                    onChange={(e) => setDistributions(prev => ({
                                      ...prev,
                                      [member.accountId]: {
                                        ...prev[member.accountId],
                                        gold: parseInt(e.target.value) || 0,
                                        rubies: prev[member.accountId]?.rubies || 0,
                                        soulShards: prev[member.accountId]?.soulShards || 0,
                                        focusedShards: prev[member.accountId]?.focusedShards || 0,
                                      }
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Rubies ({guild.bank.rubies.toLocaleString()} available)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={guild.bank.rubies}
                                    value={distributions[member.accountId]?.rubies || 0}
                                    onChange={(e) => setDistributions(prev => ({
                                      ...prev,
                                      [member.accountId]: {
                                        ...prev[member.accountId],
                                        gold: prev[member.accountId]?.gold || 0,
                                        rubies: parseInt(e.target.value) || 0,
                                        soulShards: prev[member.accountId]?.soulShards || 0,
                                        focusedShards: prev[member.accountId]?.focusedShards || 0,
                                      }
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Soul Shards ({guild.bank.soulShards.toLocaleString()} available)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={guild.bank.soulShards}
                                    value={distributions[member.accountId]?.soulShards || 0}
                                    onChange={(e) => setDistributions(prev => ({
                                      ...prev,
                                      [member.accountId]: {
                                        ...prev[member.accountId],
                                        gold: prev[member.accountId]?.gold || 0,
                                        rubies: prev[member.accountId]?.rubies || 0,
                                        soulShards: parseInt(e.target.value) || 0,
                                        focusedShards: prev[member.accountId]?.focusedShards || 0,
                                      }
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Focused Shards ({guild.bank.focusedShards.toLocaleString()} available)</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={guild.bank.focusedShards}
                                    value={distributions[member.accountId]?.focusedShards || 0}
                                    onChange={(e) => setDistributions(prev => ({
                                      ...prev,
                                      [member.accountId]: {
                                        ...prev[member.accountId],
                                        gold: prev[member.accountId]?.gold || 0,
                                        rubies: prev[member.accountId]?.rubies || 0,
                                        soulShards: prev[member.accountId]?.soulShards || 0,
                                        focusedShards: parseInt(e.target.value) || 0,
                                      }
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => {
                              const dists = Object.entries(distributions)
                                .filter(([_, v]) => v.gold > 0 || v.rubies > 0 || v.soulShards > 0 || v.focusedShards > 0)
                                .map(([accountId, v]) => ({
                                  accountId,
                                  gold: v.gold || 0,
                                  rubies: v.rubies || 0,
                                  soulShards: v.soulShards || 0,
                                  focusedShards: v.focusedShards || 0,
                                }));
                              if (dists.length > 0) {
                                distributeMutation.mutate(dists);
                              }
                            }}
                            disabled={distributeMutation.isPending}
                          >
                            Distribute
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Castle className={`w-5 h-5 ${dungeonInfo?.isDemonLordDungeon ? 'text-purple-500' : 'text-red-500'}`} />
                  {dungeonInfo?.dungeonName || "Great Dungeon"}
                  <Badge variant="destructive" className={`ml-2 ${dungeonInfo?.isDemonLordDungeon ? 'bg-purple-500' : ''}`}>
                    {dungeonInfo?.isDemonLordDungeon ? '15x Stronger + 3x Rewards' : '10x Stronger'}
                  </Badge>
                  {dungeonInfo?.petsAllowed && (
                    <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
                      Pets Allowed
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {dungeonInfo?.isDemonLordDungeon 
                    ? "The ultimate challenge! Use your pets to conquer the Demon Lord's realm!"
                    : "Fight alongside online guild members for massive rewards!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dungeonInfo && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Floor</span>
                        <Badge variant="outline" className="text-lg">
                          {dungeonInfo.displayFloor || dungeonInfo.floor} / 50
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Level</span>
                        <Badge variant="outline" className="text-lg">
                          {dungeonInfo.level} / 100
                        </Badge>
                      </div>
                      <Progress value={(dungeonInfo.level / 100) * 100} className="h-2" />
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Online Guild Members:</p>
                        <div className="flex flex-wrap gap-2">
                          {dungeonInfo.onlineMembers.length === 0 ? (
                            <span className="text-muted-foreground text-sm">None online</span>
                          ) : (
                            dungeonInfo.onlineMembers.map((m) => (
                              <div key={m.accountId} className="flex items-center gap-1">
                                <Badge variant="secondary">
                                  {m.username}
                                </Badge>
                                {dungeonInfo.petsAllowed && m.equippedPet && (
                                  <Badge variant="outline" className="text-xs border-purple-400 text-purple-400">
                                    {m.equippedPet.name}
                                  </Badge>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${dungeonInfo.isDemonLordDungeon ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                        <p className={`font-medium ${dungeonInfo.isDemonLordDungeon ? 'text-purple-500' : 'text-red-500'} flex items-center gap-2`}>
                          {dungeonInfo.isBoss && <Crown className="w-4 h-4" />}
                          {dungeonInfo.isDemonLordDungeon ? 'Demon Lord\'s Minion' : 'Dungeon Monster'} (Lvl {dungeonInfo.globalLevel})
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <span>STR: {dungeonInfo.npcStats.Str.toLocaleString()}</span>
                          <span>SPD: {dungeonInfo.npcStats.Spd.toLocaleString()}</span>
                          <span>INT: {dungeonInfo.npcStats.Int.toLocaleString()}</span>
                          <span>LUCK: {dungeonInfo.npcStats.Luck.toLocaleString()}</span>
                        </div>
                        {dungeonInfo.immunities.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Immune to:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dungeonInfo.immunities.map((el) => (
                                <Badge key={el} variant="outline" className="text-xs">
                                  {el}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <p className="font-medium text-yellow-500">
                          Rewards (to Guild Bank)
                          {dungeonInfo.isDemonLordDungeon && <span className="text-xs ml-2">(3x Bonus!)</span>}
                        </p>
                        <div className="text-sm mt-1">
                          <span className="text-yellow-500">{dungeonInfo.rewards.gold.toLocaleString()} Gold</span>
                          {dungeonInfo.rewards.rubies > 0 && (
                            <span className="text-red-400 ml-2">{dungeonInfo.rewards.rubies} Rubies</span>
                          )}
                          {dungeonInfo.rewards.soulShards > 0 && (
                            <span className="text-purple-400 ml-2">{dungeonInfo.rewards.soulShards} Soul Shards</span>
                          )}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => fightDungeonMutation.mutate()}
                        disabled={fightDungeonMutation.isPending || dungeonInfo.onlineMembers.length === 0}
                        data-testid="button-fight-dungeon"
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        {fightDungeonMutation.isPending ? "Fighting..." : `Fight with ${dungeonInfo.onlineMembers.length} Members`}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guild Battles Section */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="w-5 h-5 text-orange-500" />
                    Guild Battles
                  </div>
                  {isMaster && (
                    <Dialog open={battleDialogOpen} onOpenChange={setBattleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-challenge-guild">
                          <Plus className="w-4 h-4 mr-1" />
                          Challenge Guild
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Challenge Another Guild</DialogTitle>
                          <DialogDescription>
                            Select a guild to challenge and pick your fighters.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Select Guild</Label>
                            <Select value={selectedOpponentGuild} onValueChange={setSelectedOpponentGuild}>
                              <SelectTrigger data-testid="select-opponent-guild">
                                <SelectValue placeholder="Choose a guild..." />
                              </SelectTrigger>
                              <SelectContent>
                                {allGuilds.filter(g => g.id !== guild?.id).map(g => (
                                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Select Fighters (up to 5)</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {guild?.members.map(m => (
                                <Badge
                                  key={m.accountId}
                                  variant={selectedFighters.includes(m.accountId) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    if (selectedFighters.includes(m.accountId)) {
                                      setSelectedFighters(selectedFighters.filter(f => f !== m.accountId));
                                    } else if (selectedFighters.length < 5) {
                                      setSelectedFighters([...selectedFighters, m.accountId]);
                                    }
                                  }}
                                  data-testid={`fighter-select-${m.accountId}`}
                                >
                                  {m.username}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Selected: {selectedFighters.length}/5</p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => challengeGuildMutation.mutate({
                              challengedGuildId: selectedOpponentGuild,
                              fighters: selectedFighters
                            })}
                            disabled={!selectedOpponentGuild || selectedFighters.length === 0 || challengeGuildMutation.isPending}
                            data-testid="button-send-challenge"
                          >
                            Send Challenge
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Incoming Challenges (for guild master) */}
                {isMaster && pendingBattles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-yellow-500">Incoming Challenges</h4>
                    <div className="space-y-2">
                      {pendingBattles.map(battle => (
                        <div key={battle.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                          <div>
                            <p className="font-medium">{battle.challengerGuildName}</p>
                            <p className="text-xs text-muted-foreground">{battle.challengerFighters.length} fighters</p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog open={respondBattleId === battle.id} onOpenChange={(open) => !open && setRespondBattleId(null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setRespondBattleId(battle.id)} data-testid={`button-respond-${battle.id}`}>
                                  Accept
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Accept Challenge</DialogTitle>
                                  <DialogDescription>Select your fighters to accept this challenge.</DialogDescription>
                                </DialogHeader>
                                <div>
                                  <Label>Select Fighters (up to 5 - opponent has {battle.challengerFighters.length})</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {guild?.members.map(m => (
                                      <Badge
                                        key={m.accountId}
                                        variant={respondFighters.includes(m.accountId) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                          if (respondFighters.includes(m.accountId)) {
                                            setRespondFighters(respondFighters.filter(f => f !== m.accountId));
                                          } else if (respondFighters.length < 5) {
                                            setRespondFighters([...respondFighters, m.accountId]);
                                          }
                                        }}
                                      >
                                        {m.username}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => respondBattleMutation.mutate({
                                      battleId: battle.id,
                                      accept: true,
                                      fighters: respondFighters
                                    })}
                                    disabled={respondFighters.length !== battle.challengerFighters.length || respondBattleMutation.isPending}
                                  >
                                    Accept Battle
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => respondBattleMutation.mutate({ battleId: battle.id, accept: false })}
                              disabled={respondBattleMutation.isPending}
                              data-testid={`button-decline-${battle.id}`}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Battles */}
                {activeBattles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-green-500">Active Battles</h4>
                    <div className="space-y-2">
                      {activeBattles.map(battle => {
                        const isChallenger = battle.challengerGuildId === guild?.id;
                        const opponentName = isChallenger ? battle.challengedGuildName : battle.challengerGuildName;
                        const ourScore = isChallenger ? battle.challengerScore : battle.challengedScore;
                        const theirScore = isChallenger ? battle.challengedScore : battle.challengerScore;
                        return (
                          <div key={battle.id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div>
                              <p className="font-medium">vs {opponentName}</p>
                              <p className="text-xs text-muted-foreground">Round {battle.currentRound + 1}</p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                              {ourScore} - {theirScore}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Completed Battles */}
                {completedBattles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Recent Battles</h4>
                    <div className="space-y-2">
                      {completedBattles.map(battle => {
                        const isChallenger = battle.challengerGuildId === guild?.id;
                        const opponentName = isChallenger ? battle.challengedGuildName : battle.challengerGuildName;
                        const won = battle.winnerId === guild?.id;
                        const ourScore = isChallenger ? battle.challengerScore : battle.challengedScore;
                        const theirScore = isChallenger ? battle.challengedScore : battle.challengerScore;
                        return (
                          <div key={battle.id} className={`flex items-center justify-between p-3 rounded-lg ${won ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <div>
                              <p className="font-medium">vs {opponentName}</p>
                              <Badge variant={won ? "default" : "destructive"} className="text-xs">
                                {won ? "Victory" : "Defeat"}
                              </Badge>
                            </div>
                            <span className="font-mono">{ourScore} - {theirScore}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pendingBattles.length === 0 && activeBattles.length === 0 && completedBattles.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No guild battles yet. {isMaster && "Challenge another guild!"}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
