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
            title={icon.tooltip}
            className={className}
          >
            <Icon path={icon.path} size={1} className="h-6 w-6 text-base-11" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{icon.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
