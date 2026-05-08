import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isTriggered: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  isTriggered,
  threshold = 80
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        top: 'env(safe-area-inset-top)',
        transform: `translateY(${Math.min(pullDistance, threshold * 1.2)}px)`,
        opacity: Math.min(progress * 1.5, 1)
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-lg transition-colors",
          isTriggered && "bg-primary/10 border-primary"
        )}
      >
        <RefreshCw
          className={cn(
            "w-5 h-5 text-muted-foreground transition-colors",
            isTriggered && "text-primary",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
          }}
        />
      </div>
    </div>
  );
};
