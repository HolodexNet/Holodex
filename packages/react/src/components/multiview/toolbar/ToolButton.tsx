import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";

export type MultiViewIcon = {
  path: string;
  tooltip: string;
  onClick?: () => void;
};

export function ToolButton({
  icon,
  index,
  className = "",
}: {
  icon: MultiViewIcon;
  index?: string;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            key={index}
            onClick={icon.onClick}
            className={cn(className, "rounded-md p-2 hover:bg-slate-5")}
            variant={"ghost"}
          >
            <div className={cn(icon.path, "text-lg text-base-11")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="px-4 py-2 mt-2 rounded-md bg-slate-4"
        >
          {icon.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
