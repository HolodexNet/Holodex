import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface PullToRefreshProps {
  isPullable?: boolean;
  onRefresh: () => Promise<unknown> | void;
  refreshingContent?: JSX.Element | string;
  pullingContent?: JSX.Element | string;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  resistance?: number;
}

const attenuate = (distance: number): number => {
  const factor = 0.7; // Adjust this to control the strength of attenuation
  return Math.pow(distance, factor);
};
const calculatePullDistance = (
  rawDistance: number,
  maxPullDownDistance: number,
): number => {
  const attenuatedDistance = attenuate(rawDistance);
  return Math.min(attenuatedDistance, maxPullDownDistance);
};

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  isPullable = true,
  onRefresh,
  children,
  pullDownThreshold = 40,
  maxPullDownDistance = 60,
  resistance = 1,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    if (!isPullable) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      const currentY = e.touches[0].clientY;
      const rawDistance = (currentY - startY.current) / resistance;
      if (rawDistance > 0) {
        e.preventDefault();
        const newPullDistance = calculatePullDistance(
          rawDistance,
          maxPullDownDistance,
        );
        setPullDistance(newPullDistance);
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      if (pullDistance > pullDownThreshold) {
        setIsRefreshing(true);
        const res = onRefresh();
        if (res instanceof Promise) {
          res.finally(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          });
        } else {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      setIsPulling(false);
    };

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isPullable,
    isPulling,
    maxPullDownDistance,
    onRefresh,
    pullDistance,
    pullDownThreshold,
    resistance,
  ]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className="fixed inset-x-0 top-0 z-50 flex -translate-y-10 items-center justify-center overflow-hidden transition ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance / (pullDownThreshold / 1.8),
          pointerEvents: "none",
        }}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "rounded-full bg-base-5 p-4 text-2xl",
              pullDistance > pullDownThreshold && "bg-green-6",
            )}
          >
            {isRefreshing ? (
              <div className="i-lucide:loader-2 animate-spin" />
            ) : pullDistance > pullDownThreshold ? (
              <div className="i-lucide:diamond" />
            ) : (
              <div className="i-tabler:fold-down" />
            )}
          </div>
        </div>
      </div>
      <div
        className="transition-transform ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
