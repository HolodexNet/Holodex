import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useState } from "react";

export function PlayerDescription({
  description,
  defaultExpanded = false,
  lines = 3,
}: {
  description: string;
  defaultExpanded?: boolean;
  lines?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-base-3 p-4">
      <div
        className={cn("whitespace-pre-wrap text-sm", {
          "line-clamp-3": !isExpanded,
        })}
      >
        {description}
      </div>
      {description.split(/\r\n|\r|\n/).length > lines && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      )}
    </div>
  );
}
