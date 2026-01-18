import type { Item } from "@shared/schema";
import { ItemCard } from "./item-card";

interface ItemGridProps {
  items: Item[];
  onBuy?: (item: Item) => void;
  onSelect?: (item: Item) => void;
  onSell?: (item: Item) => void;
  showBuyButton?: boolean;
  showSellButton?: boolean;
  ownedItemIds?: string[];
  playerGold?: number;
}

export function ItemGrid({
  items,
  onBuy,
  onSelect,
  onSell,
  showBuyButton = true,
  showSellButton = false,
  ownedItemIds = [],
  playerGold = Infinity,
}: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground" data-testid="text-empty-grid">
        <p className="font-serif text-lg">No items found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="grid-items">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onBuy={onBuy}
          onSelect={onSelect}
          onSell={onSell}
          showBuyButton={showBuyButton}
          showSellButton={showSellButton}
          isOwned={ownedItemIds.includes(item.id)}
          disabled={item.price > playerGold && !ownedItemIds.includes(item.id)}
        />
      ))}
    </div>
  );
}
