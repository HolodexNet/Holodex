import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  mutateVideoToPlaceholderAtom,
  removeVideoCellAtom,
} from "@/store/multiview";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect, useRef, useState } from "react";

interface VideoCellProps {
  video: VideoBase;
  height?: number;
  width?: number;
}

export function VideoCell({ video, height, width }: VideoCellProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonHeight, setButtonHeight] = useState(0);
  const switchToPlaceholder = useSetAtom(mutateVideoToPlaceholderAtom);
  const removeVideo = useSetAtom(removeVideoCellAtom);
  const videoStatusAtom = videoStatusAtomFamily(video.id || "x");
  const statusValue = useAtomValue(videoStatusAtom);

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
          padding: statusValue.status === "playing" ? "0" : "12px 12px 0 12px",
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
      <div
        ref={buttonRef}
        className={cn(
          "flex justify-center w-full items-center transition-transform duration-200 ease-out",
          statusValue.status === "playing"
            ? "transform translate-y-full opacity-0 h-0"
            : "transform translate-y-0 opacity-100",
        )}
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
    </>
  );
}

const VideoSkeleton = () => (
  <div
    className="flex w-full justify-center items-center bg-gray-800 border border-gray-600"
    style={{ aspectRatio: "16 / 9" }}
  >
    <div className="text-white text-sm">Loading video...</div>
  </div>
);
