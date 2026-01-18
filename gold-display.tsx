import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoldDisplayProps {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GoldDisplay({ amount, className, size = "md" }: GoldDisplayProps) {
  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "flex items-center font-mono font-bold text-primary",
        sizeClasses[size],
        className
      )}
      data-testid="text-gold-balance"
    >
      <Coins className={iconSizes[size]} />
      <span>{amount.toLocaleString()}</span>
    </div>
  );
}
