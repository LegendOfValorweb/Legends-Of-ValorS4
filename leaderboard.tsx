import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Package, 
  LogOut, 
  Calendar, 
  Swords, 
  Target,
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Clock,
  RefreshCw,
  Castle,
  Users,
  Sparkles,
  ArrowLeftRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type LeaderboardEntry = {
  accountId?: string;
  username?: string;
  guildId?: string;
  guildName?: string;
  masterName?: string;
  value: number | string;
  rank: number;
  npcFloor?: number;
  npcLevel?: number;
  dungeonFloor?: number;
  dungeonLevel?: number;
};

type LeaderboardResponse = {
  type: string;
  data: LeaderboardEntry[];
  refreshedAt: string;
  nextRefresh: string;
};

const leaderboardTypes = [
  { id: "wins", label: "Wins", icon: Trophy, color: "text-yellow-500" },
  { id: "losses", label: "Losses", icon: TrendingDown, color: "text-red-500" },
  { id: "npc_progress", label: "NPC Tower", icon: Target, color: "text-purple-500" },
  { id: "rank", label: "Rank", icon: Crown, color: "text-blue-500" },
  { id: "guild_dungeon", label: "Guild Dungeon", icon: Castle, color: "text-emerald-500" },
  { id: "guild_wins", label: "Guild Wins", icon: Swords, color: "text-orange-500" },
];

const rankColors: Record<string, string> = {
  Novice: "text-gray-400",
  Apprentice: "text-green-500",
  Journeyman: "text-blue-400",
  Expert: "text-purple-400",
  Master: "text-orange-400",
  Grandmaster: "text-red-400",
  Legend: "text-yellow-400",
  Elite: "text-pink-400",
};

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const { account, logout } = useGame();
  const [activeTab, setActiveTab] = useState("wins");

  const { data: leaderboard, isLoading, refetch } = useQuery<LeaderboardResponse>({
    queryKey: ["/api/leaderboards", activeTab],
    enabled: !!account,
    refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes
  });

  if (!account) {
    navigate("/");
    return null;
  }

  const renderLeaderboardEntry = (entry: LeaderboardEntry, type: string, key: string) => {
    const isGuildLeaderboard = type === "guild_dungeon" || type === "guild_wins";
    const isCurrentPlayer = !isGuildLeaderboard && entry.accountId === account.id;
    const displayName = isGuildLeaderboard ? entry.guildName : entry.username;
    
    const rankBadge = entry.rank <= 3 ? (
      <Badge variant={entry.rank === 1 ? "default" : "secondary"} className={
        entry.rank === 1 ? "bg-yellow-500 text-black" : 
        entry.rank === 2 ? "bg-gray-300 text-black" : 
        "bg-amber-700 text-white"
      }>
        #{entry.rank}
      </Badge>
    ) : (
      <span className="text-muted-foreground w-8 text-center">#{entry.rank}</span>
    );

    return (
      <div
        key={key}
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          isCurrentPlayer ? "bg-primary/10 border border-primary/30" : "bg-card/50 hover-elevate"
        }`}
        data-testid={`leaderboard-entry-${key}`}
      >
        <div className="flex items-center gap-3">
          {rankBadge}
          {isGuildLeaderboard && <Castle className="h-4 w-4 text-emerald-500" />}
          <div className="flex flex-col">
            <span className={`font-medium ${isCurrentPlayer ? "text-primary" : ""}`}>
              {displayName}
              {isCurrentPlayer && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
            </span>
            {isGuildLeaderboard && entry.masterName && (
              <span className="text-xs text-muted-foreground">Leader: {entry.masterName}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {type === "npc_progress" ? (
            <Badge variant="outline" className="font-mono">
              Floor {entry.npcFloor}:{entry.npcLevel}
            </Badge>
          ) : type === "guild_dungeon" ? (
            <Badge variant="outline" className="font-mono text-emerald-500 border-emerald-500/50">
              Floor {entry.dungeonFloor} - Lvl {entry.dungeonLevel}
            </Badge>
          ) : type === "rank" ? (
            <span className={`font-semibold ${rankColors[entry.value as string] || ""}`}>
              {entry.value}
            </span>
          ) : (
            <span className="font-mono font-bold">{entry.value.toLocaleString()}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="font-cinzel text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Leaderboards
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
                onClick={() => navigate("/guild")}
                data-testid="link-guild"
              >
                <Users className="h-4 w-4 mr-1" />
                Guild
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/skills")}
                className="toggle-elevate"
                data-testid="link-skills"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Skills
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/trading")}
                className="toggle-elevate"
                data-testid="link-trading"
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Trade
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Hall of Champions
              </CardTitle>
              {leaderboard && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Updated {formatDistanceToNow(new Date(leaderboard.refreshedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                {leaderboardTypes.map((type) => (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    className="flex items-center gap-1"
                    data-testid={`tab-${type.id}`}
                  >
                    <type.icon className={`h-4 w-4 ${type.color}`} />
                    <span className="hidden sm:inline">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {leaderboardTypes.map((type) => (
                <TabsContent key={type.id} value={type.id}>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : leaderboard?.data?.length ? (
                    <div className="space-y-2">
                      {leaderboard.data.map((entry) => {
                        const entryKey = (type.id === "guild_dungeon" || type.id === "guild_wins") 
                          ? entry.guildId || `guild-${entry.rank}` 
                          : entry.accountId || `player-${entry.rank}`;
                        return renderLeaderboardEntry(entry, type.id, entryKey);
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No data available yet
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {leaderboard && (
              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-sm text-muted-foreground">
                <span>Next refresh: {formatDistanceToNow(new Date(leaderboard.nextRefresh), { addSuffix: true })}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
