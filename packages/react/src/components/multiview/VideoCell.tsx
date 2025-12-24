import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn } from "@/lib/utils";

interface VideoCellProps {
  videoId: string;
  hidden?: boolean;
}

/**
 * Video player cell for multiview.
 * Wraps PlayerWrapper with multiview-specific styling.
 */
export function VideoCell({ videoId, hidden }: VideoCellProps) {
  // Determine video URL based on ID format
  const url = getVideoUrl(videoId);

  return (
    <div
      className={cn(
        "h-full w-full",
        hidden &&
          "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0",
      )}
    >
      <PlayerWrapper id={videoId} url={url} />
    </div>
  );
}

/**
 * Generate video URL from ID.
 * Supports YouTube and Twitch.
 */
function getVideoUrl(videoId: string): string {
  // Twitch streams have channel names, not 11-char IDs
  if (videoId.length !== 11 || videoId.includes("_")) {
    return `https://www.twitch.tv/${videoId}`;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
