import type { ItemTier } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { TIER_LABELS } from "@/lib/items-data";
import { cn } from "@/lib/utils";

interface TierFilterProps {
  selectedTier: ItemTier | "all";
  onSelectTier: (tier: ItemTier | "all") => void;
  excludeTiers?: ItemTier[];
}

const tierButtonStyles: Record<ItemTier | "all", string> = {
  all: "data-[state=on]:bg-secondary",
  normal: "data-[state=on]:bg-tier-normal/20 data-[state=on]:text-tier-normal data-[state=on]:border-tier-normal",
  super_rare: "data-[state=on]:bg-tier-super-rare/20 data-[state=on]:text-tier-super-rare data-[state=on]:border-tier-super-rare",
  x_tier: "data-[state=on]:bg-tier-x/20 data-[state=on]:text-tier-x data-[state=on]:border-tier-x",
  umr: "data-[state=on]:bg-tier-umr/20 data-[state=on]:text-tier-umr data-[state=on]:border-tier-umr",
  ssumr: "data-[state=on]:bg-tier-ssumr/20 data-[state=on]:text-tier-ssumr data-[state=on]:border-tier-ssumr",
  divine: "data-[state=on]:bg-tier-divine/20 data-[state=on]:text-tier-divine data-[state=on]:border-tier-divine",
  journeyman: "data-[state=on]:bg-tier-journeyman/20 data-[state=on]:text-tier-journeyman data-[state=on]:border-tier-journeyman",
  expert: "data-[state=on]:bg-tier-expert/20 data-[state=on]:text-tier-expert data-[state=on]:border-tier-expert",
  master: "data-[state=on]:bg-tier-master/20 data-[state=on]:text-tier-master data-[state=on]:border-tier-master",
  grandmaster: "data-[state=on]:bg-tier-grandmaster/20 data-[state=on]:text-tier-grandmaster data-[state=on]:border-tier-grandmaster",
  legend: "data-[state=on]:bg-tier-legend/20 data-[state=on]:text-tier-legend data-[state=on]:border-tier-legend",
  elite: "data-[state=on]:bg-tier-elite/20 data-[state=on]:text-tier-elite data-[state=on]:border-tier-elite",
};

export function TierFilter({ selectedTier, onSelectTier, excludeTiers = [] }: TierFilterProps) {
  const allTiers: (ItemTier | "all")[] = ["all", "normal", "super_rare", "x_tier", "umr", "ssumr", "divine", "journeyman", "expert", "master", "grandmaster", "legend", "elite"];
  const tiers = allTiers.filter(t => t === "all" || !excludeTiers.includes(t as ItemTier));

  return (
    <div className="flex flex-wrap gap-2" data-testid="filter-tier">
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier;
        return (
          <Button
            key={tier}
            variant={isSelected ? "secondary" : "outline"}
            size="sm"
            onClick={() => onSelectTier(tier)}
            className={cn(
              "transition-all toggle-elevate",
              isSelected && "toggle-elevated",
              tierButtonStyles[tier]
            )}
            data-state={isSelected ? "on" : "off"}
            data-testid={`button-filter-${tier}`}
          >
            {tier === "all" ? "All Items" : TIER_LABELS[tier]}
          </Button>
        );
      })}
    </div>
  );
}
