import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";
import { Cell, editModeAtom } from "@/store/multiview";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";
import { MultiviewCell } from "./MultiviewCell";

interface VideoCellProps {
  videoId: string;
  hidden?: boolean;
  cell: Cell;
}

/**
 * Video player cell for multiview.
 * Wraps PlayerWrapper with multiview-specific styling.
 */
export function VideoCell({ videoId, hidden, cell }: VideoCellProps) {
  // Use shared utility that handles tw: prefix for Twitch and defaults to YouTube
  const url = idToVideoURL(videoId);
  const editMode = useAtomValue(editModeAtom);
  const videoData = useAtomValue(videoStatusAtomFamily(videoId));

  return (
    <div
      className={cn(
        "h-full w-full",
        hidden &&
          "pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0",
      )}
    >
      <PlayerWrapper id={videoId} url={url} />
      {!editMode &&
        (videoData.status == "buffering" || videoData.status == "ended") && (
          <div className="absolute inset-0 z-50 flex items-center justify-center">
            <MultiviewCell cell={cell} id={cell.id} />
          </div>
        )}
    </div>
  );
}
