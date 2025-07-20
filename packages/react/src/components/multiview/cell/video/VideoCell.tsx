import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  mutateVideoToPlaceholderAtom,
  removeVideoCellAtom,
  updateCellStatusAtom,
} from "@/store/multiview";
import { defaultPlayerEventBus } from "@/store/player";
import { useSetAtom } from "jotai";
import { Suspense, useEffect, useRef, useState } from "react";

interface VideoCellProps {
  video: VideoBase;
  height?: number;
  width?: number;
  status: VideoCellStatus;
}

export function VideoCell({ video, height, width, status }: VideoCellProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonHeight, setButtonHeight] = useState(0);
  const removeVideo = useSetAtom(removeVideoCellAtom);
  const switchToPlaceholder = useSetAtom(mutateVideoToPlaceholderAtom);

  const updateCellStatus = useSetAtom(updateCellStatusAtom);
  const cellId = `video_${video.id}`;

  useEffect(() => {
    const handlePlay = (playerId: string) => {
      if (playerId === video.id) {
        updateCellStatus({ cellId, status: "playing" });
      }
    };

    const handlePause = (playerId: string) => {
      if (playerId === video.id) {
        updateCellStatus({ cellId, status: "paused" });
      }
    };

    const handleError = (playerId: string, ...errorDetails: unknown[]) => {
      if (playerId === video.id) {
        console.error("Video error for", playerId, errorDetails);
      }
    };

    // Subscribe to events
    defaultPlayerEventBus.on("onPlay", handlePlay);
    defaultPlayerEventBus.on("onPause", handlePause);
    defaultPlayerEventBus.on("onError", handleError);

    return () => {
      defaultPlayerEventBus.off("onPlay", handlePlay);
      defaultPlayerEventBus.off("onPause", handlePause);
      defaultPlayerEventBus.off("onError", handleError);
    };
  }, [video.id, cellId, updateCellStatus]);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonHeight(buttonRef.current.offsetHeight);
    }
  }, []);

  const videoHeight =
    height && buttonHeight ? height - buttonHeight : undefined;

  return (
    <>
      <div
        className="video-cell-video flex-1"
        style={{
          width: "auto",
          height: videoHeight ? `${videoHeight}px` : "auto",
          aspectRatio: "16 / 9",
        }}
      >
        <Suspense key={video.id} fallback={<VideoSkeleton />}>
          <PlayerWrapper
            id={video.id}
            url={idToVideoURL(video.id)}
            autoplay={false}
          />
        </Suspense>
      </div>
      {status !== "playing" && (
        <div
          ref={buttonRef}
          className="flex justify-center w-full items-center"
        >
          <Button
            onClick={() => switchToPlaceholder(video.id)}
            className={cn("rounded-md p-2 hover:bg-slate-5")}
            variant={"ghost"}
          >
            <div
              className={cn("i-heroicons:chevron-left", "text-lg text-base-11")}
            />
          </Button>
          <Button
            onClick={() => removeVideo(video.id)}
            className={cn("rounded-md p-2 hover:bg-slate-5")}
            variant={"ghost"}
          >
            <div className={cn("i-heroicons:trash", "text-lg text-base-11")} />
          </Button>
        </div>
      )}
    </>
  );
}

const VideoSkeleton = () => (
  <div
    className="w-full flex justify-center items-center bg-gray-800 border border-gray-600"
    style={{ aspectRatio: "16 / 9" }}
  >
    <div className="text-white text-sm">Loading video...</div>
  </div>
);
