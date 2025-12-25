import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shadcn/ui/hover-card";
import { useAutoLayout } from "@/hooks/useAutoLayout";
import { useDuration } from "@/hooks/useDuration";
import { formatDurationShort } from "@/lib/time";
import { cn, resizeChannelPhoto } from "@/lib/utils";
import { VideoCard } from "@/components/video/VideoCard";

interface SelectorLiveItemProps {
  live: Live;
}

/**
 * Format a duration to show only the largest unit (e.g. "2h", "54m", "30s")
 * Used for compact countdown display of upcoming streams.
 */
function formatCountdown(millisecs: number): string {
  const absSeconds = Math.abs(millisecs) / 1000;
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = Math.floor(absSeconds % 60);

  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/**
 * A compact live channel item for the multiview selector toolbar.
 * Shows channel avatar with duration badge, and VideoCard on hover.
 */
export function SelectorLiveItem({ live }: SelectorLiveItemProps) {
  const { addVideo } = useAutoLayout();

  const handleClick = () => {
    addVideo({ id: live.id });
  };

  // Calculate duration (ms) for live streams or time until stream for upcoming
  const durationMs = useDuration({
    type: live.type,
    status: live.status,
    duration: live.duration ?? 0,
    end_actual: live.end_actual,
    start_actual: live.start_actual,
  });

  // For upcoming streams, calculate time-to-live
  const timeToLiveMs =
    live.status === "upcoming" && live.available_at
      ? new Date(live.available_at).valueOf() - Date.now()
      : null;

  const isLive = live.status === "live";
  const isUpcoming = live.status === "upcoming";

  // Display format: live duration (HH:MM:SS) for live streams, compact countdown (Xh/Xm) for upcoming
  const displayDuration = isLive
    ? durationMs
      ? formatDurationShort(durationMs)
      : "LIVE"
    : isUpcoming && timeToLiveMs
      ? formatCountdown(timeToLiveMs)
      : null;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={handleClick}
          className="relative shrink-0 cursor-pointer focus:outline-none"
          title={`Add ${live.channel?.name} to multiview`}
        >
          <Avatar
            className="size-10 ring-2 ring-offset-1 ring-offset-background transition-transform hover:scale-105 active:scale-95"
            style={
              {
                "--tw-ring-color": isLive
                  ? "rgb(239 68 68)"
                  : "rgb(59 130 246)",
              } as React.CSSProperties
            }
          >
            <AvatarImage
              src={
                live.channel?.photo
                  ? resizeChannelPhoto(live.channel.photo, 88)
                  : undefined
              }
              alt={live.channel?.name}
            />
            <AvatarFallback className="text-xs">
              {live.channel?.name?.slice(0, 2).toUpperCase() || "CH"}
            </AvatarFallback>
          </Avatar>
          {/* Duration/countdown badge */}
          {displayDuration && (
            <span
              className={cn(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm px-1 text-[10px] font-medium leading-tight text-white",
                isLive ? "bg-red-600" : "bg-blue-600",
              )}
            >
              {displayDuration}
            </span>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="overflow-hidden w-72 p-0"
      >
        {/* Render the VideoCard on hover */}
        <VideoCard
          video={live}
          size="md"
          onClick={(part, _video, event) => {
            // Clicking anywhere on the hover card adds to multiview
            event.preventDefault();
            event.stopPropagation();
            handleClick();
          }}
          showDuration={true}
          showStatus={true}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
