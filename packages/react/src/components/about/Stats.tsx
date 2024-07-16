/**
 * v0 by Vercel.
 * @see https://v0.dev/t/KfbKQpc7Uhn
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card";
import { useState, useEffect } from "react";

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
  timeText?: string; // e.g. "last week"
}

/**
 * Renders a statistic card with an animated display of the amount.
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
    <Card className="">
      <CardHeader className="space-y-1 p-4 pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">
          {displayAmount.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {change && (
          <div
            className={`text-xs ${displayAmount > 0 ? "text-green-10" : "text-red-10"}`}
          >
            {change > 0 ? `+${change} ` : `${change} `}
            {timeText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
