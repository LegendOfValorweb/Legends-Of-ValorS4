import type { ItemType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Sword, Shield, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypeFilterProps {
  selectedType: ItemType | "all";
  onSelectType: (type: ItemType | "all") => void;
}

const typeConfig: Record<ItemType | "all", { label: string; icon?: typeof Sword }> = {
  all: { label: "All Types" },
  weapon: { label: "Weapons", icon: Sword },
  armor: { label: "Armor", icon: Shield },
  accessory: { label: "Accessories", icon: Gem },
};

export function TypeFilter({ selectedType, onSelectType }: TypeFilterProps) {
  const types: (ItemType | "all")[] = ["all", "weapon", "armor", "accessory"];

  return (
    <div className="flex flex-wrap gap-2" data-testid="filter-type">
      {types.map((type) => {
        const isSelected = selectedType === type;
        const config = typeConfig[type];
        const Icon = config.icon;

        return (
          <Button
            key={type}
            variant={isSelected ? "secondary" : "outline"}
            size="sm"
            onClick={() => onSelectType(type)}
            className={cn("transition-all toggle-elevate", isSelected && "toggle-elevated")}
            data-testid={`button-filter-type-${type}`}
          >
            {Icon && <Icon className="w-4 h-4 mr-1.5" />}
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
