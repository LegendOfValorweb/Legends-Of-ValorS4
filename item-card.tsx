import type { Item, ItemTier } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sword, Shield, Gem, Zap, Brain, Wind, Sparkles, Coins, DollarSign } from "lucide-react";
import { TIER_LABELS } from "@/lib/items-data";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  onBuy?: (item: Item) => void;
  onSelect?: (item: Item) => void;
  onSell?: (item: Item) => void;
  showBuyButton?: boolean;
  showSellButton?: boolean;
  isOwned?: boolean;
  disabled?: boolean;
  inventoryId?: string;
}

const tierStyles: Record<ItemTier, string> = {
  normal: "border-tier-normal/50 hover:border-tier-normal",
  super_rare: "border-tier-super-rare/50 hover:border-tier-super-rare",
  x_tier: "border-tier-x/50 hover:border-tier-x",
  umr: "border-tier-umr/50 hover:border-tier-umr",
  ssumr: "border-tier-ssumr/50 hover:border-tier-ssumr",
  divine: "border-tier-divine/50 hover:border-tier-divine",
  journeyman: "border-tier-journeyman/50 hover:border-tier-journeyman",
  expert: "border-tier-expert/50 hover:border-tier-expert",
  master: "border-tier-master/50 hover:border-tier-master",
  grandmaster: "border-tier-grandmaster/50 hover:border-tier-grandmaster",
  legend: "border-tier-legend/50 hover:border-tier-legend",
  elite: "border-tier-elite/50 hover:border-tier-elite",
};

const tierBadgeStyles: Record<ItemTier, string> = {
  normal: "bg-tier-normal/20 text-tier-normal border-tier-normal/30",
  super_rare: "bg-tier-super-rare/20 text-tier-super-rare border-tier-super-rare/30",
  x_tier: "bg-tier-x/20 text-tier-x border-tier-x/30",
  umr: "bg-tier-umr/20 text-tier-umr border-tier-umr/30",
  ssumr: "bg-tier-ssumr/20 text-tier-ssumr border-tier-ssumr/30",
  divine: "bg-tier-divine/20 text-tier-divine border-tier-divine/30",
  journeyman: "bg-tier-journeyman/20 text-tier-journeyman border-tier-journeyman/30",
  expert: "bg-tier-expert/20 text-tier-expert border-tier-expert/30",
  master: "bg-tier-master/20 text-tier-master border-tier-master/30",
  grandmaster: "bg-tier-grandmaster/20 text-tier-grandmaster border-tier-grandmaster/30",
  legend: "bg-tier-legend/20 text-tier-legend border-tier-legend/30",
  elite: "bg-tier-elite/20 text-tier-elite border-tier-elite/30",
};

const tierGlowStyles: Record<ItemTier, string> = {
  normal: "hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]",
  super_rare: "hover:shadow-[0_0_20px_rgba(167,139,250,0.2)]",
  x_tier: "hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]",
  umr: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  ssumr: "hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]",
  divine: "hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]",
  journeyman: "hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]",
  expert: "hover:shadow-[0_0_28px_rgba(192,132,252,0.45)]",
  master: "hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]",
  grandmaster: "hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]",
  legend: "hover:shadow-[0_0_35px_rgba(250,204,21,0.6)]",
  elite: "hover:shadow-[0_0_40px_rgba(232,121,249,0.7)]",
};

function ItemIcon({ type }: { type: Item["type"] }) {
  const iconClass = "w-10 h-10";
  switch (type) {
    case "weapon":
      return <Sword className={cn(iconClass, "text-stat-str")} />;
    case "armor":
      return <Shield className={cn(iconClass, "text-stat-int")} />;
    case "accessory":
      return <Gem className={cn(iconClass, "text-stat-luck")} />;
  }
}

function StatDisplay({ statName, value }: { statName: string; value: number }) {
  const statConfig: Record<string, { icon: typeof Zap; color: string }> = {
    Str: { icon: Zap, color: "text-stat-str" },
    Int: { icon: Brain, color: "text-stat-int" },
    Spd: { icon: Wind, color: "text-stat-spd" },
    Luck: { icon: Sparkles, color: "text-stat-luck" },
    Pot: { icon: Sparkles, color: "text-tier-super-rare" },
  };

  const config = statConfig[statName] || { icon: Zap, color: "text-muted-foreground" };
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1.5" data-testid={`stat-${statName.toLowerCase()}`}>
      <Icon className={cn("w-3.5 h-3.5", config.color)} />
      <span className="text-xs font-mono text-muted-foreground">{statName}</span>
      <span className={cn("text-xs font-mono font-semibold", config.color)}>+{value}</span>
    </div>
  );
}

export function ItemCard({
  item,
  onBuy,
  onSelect,
  onSell,
  showBuyButton = true,
  showSellButton = false,
  isOwned = false,
  disabled = false,
  inventoryId,
}: ItemCardProps) {
  const handleClick = () => {
    if (onSelect) onSelect(item);
  };

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300 cursor-pointer",
        tierStyles[item.tier],
        tierGlowStyles[item.tier],
        isOwned && "ring-2 ring-tier-normal/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleClick}
      data-testid={`card-item-${item.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-md bg-secondary/50",
            tierStyles[item.tier].replace("border", "border-l-2")
          )}>
            <ItemIcon type={item.type} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-sm truncate" data-testid={`text-item-name-${item.id}`}>
              {item.name}
            </h3>
            <Badge
              variant="outline"
              size="sm"
              className={cn("mt-1", tierBadgeStyles[item.tier])}
              data-testid={`badge-tier-${item.id}`}
            >
              {TIER_LABELS[item.tier]}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(item.stats).map(([stat, value]) =>
            value ? <StatDisplay key={stat} statName={stat} value={value} /> : null
          )}
        </div>

        {item.special && (
          <div className="mt-2">
            <Badge variant="secondary" size="sm" className="text-xs">
              {item.special}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" data-testid={`text-price-${item.id}`}>
          <Coins className="w-4 h-4 text-primary" />
          <span className="font-mono font-bold text-primary">{item.price.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          {showSellButton && onSell && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600/50 hover:bg-green-600/10"
              onClick={(e) => {
                e.stopPropagation();
                onSell(item);
              }}
              data-testid={`button-sell-${item.id}`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Sell
            </Button>
          )}
          {showBuyButton && onBuy && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBuy(item);
              }}
              disabled={disabled || isOwned}
              data-testid={`button-buy-${item.id}`}
            >
              {isOwned ? "Owned" : "Buy"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
