import { cn } from "@/lib/utils";
import Icon from "@mdi/react";
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
            // eslint-disable-next-line tailwindcss/no-custom-classname
            className={cn(className, "rounded-md p-2 hover:bg-slate-5")}
          >
            <Icon path={icon.path} size={1} className="h-6 w-6 text-base-11" />
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
