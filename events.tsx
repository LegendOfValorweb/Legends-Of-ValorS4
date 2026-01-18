import { useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Event, EventRegistration } from "@shared/schema";
import { useGame } from "@/lib/game-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Package, ShoppingBag, LogOut, AlertTriangle, Check, UserPlus, Clock, Swords, ArrowLeft, Target, ScrollText, Trophy, ArrowLeftRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PlayerEventRegistration extends EventRegistration {
  event: Event | null;
}

export default function Events() {
  const [, navigate] = useLocation();
  const { account, inventory, logout } = useGame();
  const { toast } = useToast();

  const { data: allEvents = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: myRegistrations = [], isLoading: registrationsLoading } = useQuery<PlayerEventRegistration[]>({
    queryKey: ["/api/accounts", account?.id, "events"],
    enabled: !!account?.id,
  });

  const registeredEventIds = useMemo(() => {
    return new Set(myRegistrations.map(reg => reg.eventId));
  }, [myRegistrations]);

  const handleRegister = async (event: Event) => {
    if (!account) return;

    try {
      await apiRequest("POST", `/api/events/${event.id}/register`, {
        accountId: account.id,
      });

      toast({
        title: "Registered!",
        description: `You are now registered for ${event.name}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account.id, "events"] });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Could not register for this event.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async (event: Event) => {
    if (!account) return;

    if (event.isMandatory) {
      toast({
        title: "Cannot unregister",
        description: "This is a mandatory event. You cannot unregister.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("DELETE", `/api/events/${event.id}/register/${account.id}`);

      toast({
        title: "Unregistered",
        description: `You have been removed from ${event.name}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/accounts", account.id, "events"] });
    } catch (error) {
      toast({
        title: "Failed to unregister",
        description: "Could not unregister from this event.",
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

  const isLoading = eventsLoading || registrationsLoading;

  const upcomingEvents = allEvents.filter(e => new Date(e.startDate) > new Date());
  const activeEvents = allEvents.filter(e => {
    const now = new Date();
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : null;
    return start <= now && (!end || end >= now);
  });
  const pastEvents = allEvents.filter(e => {
    const end = e.endDate ? new Date(e.endDate) : null;
    return end && end < new Date();
  });

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
              <h1 className="font-serif text-xl font-bold text-foreground" data-testid="text-events-title">
                Events
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
                  onClick={() => navigate("/events")}
                  className="toggle-elevate toggle-elevated"
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
                  <Target className="w-4 h-4 mr-1.5" />
                  Guild
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground" data-testid="text-player-name">
                  {account.username}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-player-rank">
                  {account.rank}
                </p>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading events...</div>
        ) : allEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-semibold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground">Check back later for upcoming events!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {activeEvents.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Active Events
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isRegistered={registeredEventIds.has(event.id)}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      registration={myRegistrations.find(r => r.eventId === event.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Events
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isRegistered={registeredEventIds.has(event.id)}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      registration={myRegistrations.find(r => r.eventId === event.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {pastEvents.length > 0 && (
              <section>
                <h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" />
                  Past Events
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isRegistered={registeredEventIds.has(event.id)}
                      isPast
                      registration={myRegistrations.find(r => r.eventId === event.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  isPast?: boolean;
  onRegister?: (event: Event) => void;
  onUnregister?: (event: Event) => void;
  registration?: PlayerEventRegistration;
}

function EventCard({ event, isRegistered, isPast, onRegister, onUnregister, registration }: EventCardProps) {
  return (
    <Card data-testid={`card-event-${event.id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base flex items-center justify-between gap-2">
          <span>{event.name}</span>
          <div className="flex gap-1">
            {event.isMandatory && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Mandatory
              </Badge>
            )}
            {isRegistered && (
              <Badge variant="secondary" className="text-[10px] bg-green-500/20 text-green-600">
                <Check className="w-3 h-3 mr-1" />
                Registered
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{event.description}</p>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Start: {new Date(event.startDate).toLocaleDateString()} {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {event.endDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>End: {new Date(event.endDate).toLocaleDateString()} {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
        
        {registration?.isAutoRegistered && (
          <p className="text-[10px] text-muted-foreground italic">
            Auto-registered (mandatory event)
          </p>
        )}

        {!isPast && (
          <div className="pt-2">
            {isRegistered ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onUnregister?.(event)}
                disabled={event.isMandatory}
                data-testid={`button-unregister-${event.id}`}
              >
                {event.isMandatory ? "Cannot Unregister" : "Unregister"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={() => onRegister?.(event)}
                data-testid={`button-register-${event.id}`}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Register
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
