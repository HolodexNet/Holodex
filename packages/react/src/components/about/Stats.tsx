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
  title: string;
  amount: number;
  change?: number;
  duration: number;
  timeText?: string; // e.g. "last week"
}

/**
 * Renders a statistic component with an animated display of the amount.
 *
 * @param {StatBlockProps} props - The props for the component.
 * @param {string} props.title - The title of the statistic.
 * @param {number} props.amount - The initial amount to display.
 * @param {number} props.change - The change in the amount.
 * @param {number} props.duration - The duration of the animation in milliseconds.
 * @param {string} props.timeText - The text to display after the amount.
 * @return {JSX.Element} The rendered statistic component.
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
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-4xl">
          {displayAmount.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {change && (
          <div
            className={`text-xs ${displayAmount > 0 ? "text-green-10" : "text-red-10"}`}
          >
            {change > 0 ? `+${change}` : `${change}`}
            {timeText}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
