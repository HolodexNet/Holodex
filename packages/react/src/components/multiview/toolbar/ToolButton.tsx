import { cn } from "@/lib/utils";
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
          <button
            key={index}
            onClick={icon.onClick}
            className={cn(className, "rounded-md p-2 hover:bg-slate-5")}
          >
            <div className={cn(icon.path, "bg-slate-4")} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="mt-2 rounded-md bg-slate-4 px-4 py-2"
        >
          {icon.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
