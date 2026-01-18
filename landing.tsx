import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sword, Crown, Sparkles, Shield, Gem, Zap, Loader2 } from "lucide-react";
import { useGame } from "@/lib/game-context";

export default function Landing() {
  const [, navigate] = useLocation();
  const { login, isLoading } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [playerPassword, setPlayerPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showLogin, setShowLogin] = useState<"none" | "player" | "admin">("none");
  const [error, setError] = useState("");

  const handlePlayerLogin = async () => {
    if (!playerName.trim() || !playerPassword) return;
    setError("");
    const result = await login(playerName.trim(), playerPassword, "player");
    if (result.account) {
      navigate("/shop");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleAdminLogin = async () => {
    if (!adminName.trim() || !adminPassword) return;
    setError("");
    const result = await login(adminName.trim(), adminPassword, "admin");
    if (result.account) {
      navigate("/admin");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, hsl(var(--tier-super-rare) / 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(var(--tier-x) / 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Sword className="w-8 h-8 text-primary" />
            <h1 className="font-serif text-2xl font-bold tracking-wider text-foreground">
              LEGEND OF VALOR
            </h1>
            <Sword className="w-8 h-8 text-primary transform scale-x-[-1]" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
          <div className="text-center mb-12 max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Forge Your <span className="text-primary">Legend</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Discover legendary weapons, armor, and artifacts. Trade with other adventurers and build your ultimate arsenal.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <FeatureCard
              icon={<Sword className="w-6 h-6 text-stat-str" />}
              title="Epic Weapons"
              description="From common blades to legendary artifacts"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-stat-int" />}
              title="Mythic Armor"
              description="Protection worthy of the gods"
            />
            <FeatureCard
              icon={<Gem className="w-6 h-6 text-stat-luck" />}
              title="Rare Accessories"
              description="Rings, amulets, and enchanted trinkets"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-tier-ssumr" />}
              title="5 Rarity Tiers"
              description="Normal to SSUMR legendary items"
            />
          </div>

          {showLogin === "none" ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setShowLogin("player")}
                className="min-w-[200px] font-serif"
                data-testid="button-start-player"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start as Player
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLogin("admin")}
                className="min-w-[200px] font-serif"
                data-testid="button-start-admin"
              >
                <Crown className="w-5 h-5 mr-2" />
                Admin Login
              </Button>
            </div>
          ) : (
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  {showLogin === "player" ? (
                    <>
                      <Zap className="w-5 h-5 text-primary" />
                      Player Login
                    </>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 text-tier-x" />
                      Admin Login
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {showLogin === "player"
                    ? "Enter your adventurer name to begin"
                    : "Access the admin control panel"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showLogin === "player" ? handlePlayerLogin() : handleAdminLogin();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder={showLogin === "player" ? "Enter adventurer name..." : "Enter admin name..."}
                      value={showLogin === "player" ? playerName : adminName}
                      onChange={(e) =>
                        showLogin === "player"
                          ? setPlayerName(e.target.value)
                          : setAdminName(e.target.value)
                      }
                      autoFocus
                      disabled={isLoading}
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password..."
                      value={showLogin === "player" ? playerPassword : adminPassword}
                      onChange={(e) =>
                        showLogin === "player"
                          ? setPlayerPassword(e.target.value)
                          : setAdminPassword(e.target.value)
                      }
                      disabled={isLoading}
                      data-testid="input-password"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowLogin("none");
                        setError("");
                      }}
                      className="flex-1"
                      disabled={isLoading}
                      data-testid="button-cancel"
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading} data-testid="button-login">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : showLogin === "player" ? (
                        "Enter World"
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </main>

        <footer className="p-6 text-center text-muted-foreground text-sm">
          <p>Legend of Valor - An Epic RPG Item Trading Experience</p>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50 border border-border w-40">
      <div className="p-2 rounded-md bg-secondary/50 mb-2">{icon}</div>
      <h3 className="font-serif font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
