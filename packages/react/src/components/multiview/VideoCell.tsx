import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";

interface VideoCellProps {
  videoId: string;
  hidden?: boolean;
}

/**
 * Video player cell for multiview.
 * Wraps PlayerWrapper with multiview-specific styling.
 */
export function VideoCell({ videoId, hidden }: VideoCellProps) {
  // Use shared utility that handles tw: prefix for Twitch and defaults to YouTube
  const url = idToVideoURL(videoId);

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
