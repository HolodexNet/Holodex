import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { removeMultiviewVideoAtom } from "@/store/multiview";
import { useAtom } from "jotai";
import { Suspense, useEffect, useRef, useState } from "react";

interface VideoCellProps {
  video: VideoBase;
  height?: number;
  width?: number;
}

export function VideoCell({ video, height, width }: VideoCellProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonHeight, setButtonHeight] = useState(0);
  const [_, removeVideo] = useAtom(removeMultiviewVideoAtom);

  useEffect(() => {
    if (buttonRef.current) {
      setButtonHeight(buttonRef.current.offsetHeight);
    }
  }, []);

  const videoHeight =
    height && buttonHeight ? height - buttonHeight : undefined;

  return (
    <div
      className="flex flex-col"
      style={{
        height: height ? `${height}px` : "100%",
        // padding: "10px",
        boxSizing: "border-box",
      }}
    >
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
      <div ref={buttonRef} className="flex justify-center w-full items-center">
        <Button
          onClick={() => removeVideo(video.id)}
          className={cn("rounded-md p-2 hover:bg-slate-5")}
          variant={"ghost"}
        >
          <div className={cn("i-heroicons:trash", "text-lg text-base-11")} />
        </Button>
      </div>
    </div>
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
