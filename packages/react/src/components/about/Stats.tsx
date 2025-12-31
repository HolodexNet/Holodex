import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/shadcn/ui/card";

/**
 * Props for the StatBlock component.
 */
interface StatBlockProps {
  /**
   * The title of the statistic.
   */
  title: string;

  /**
   * The initial amount to display.
   */
  amount: number;

  /**
   * The change in the amount. Optional.
   */
  change?: number;

  /**
   * The duration of the animation in milliseconds.
   */
  duration: number;

  /**
   * The text to display after the amount. Optional.
   */
  timeText?: string;
}

/**
 * Renders a statistic block with an animated display of the amount.
 */
export default function StatComponent({
  title,
  amount,
  change,
  duration,
  timeText,
}: StatBlockProps) {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const animationLoop = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentAmount = Math.floor(progress * amount);
      setDisplayAmount(currentAmount);
      if (progress < 1) {
        requestAnimationFrame(animationLoop);
      }
    };
    requestAnimationFrame(animationLoop);
  }, [amount, duration]);

  return (
    <Card>
      <CardContent>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="max-w-min bg-linear-to-r from-primary to-foreground bg-clip-text text-3xl text-transparent drop-shadow-[2px_1px_24px_var(--primary)] transition-all duration-300 dark:from-foreground dark:to-primary">
          {displayAmount.toLocaleString()}
        </CardTitle>
        {change !== undefined && (
          <div
            className={`text-xs ${change > 0 ? "text-green-10" : "text-red-10"}`}
          >
            {change > 0 ? `+${change} ` : `${change} `}
            {timeText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
