import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { cn, idToVideoURL } from "@/lib/utils";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";
import { Suspense } from "react";
import { VideoCellControl } from "./VideoCellControl";

interface VideoCellProps {
  id: string;
}

export function VideoCell({ id }: VideoCellProps) {
  const videoStatusAtom = videoStatusAtomFamily(id || "x");
  const statusValue = useAtomValue(videoStatusAtom);

  console.log("video cell rendered");

  return (
    <>
      <div
        className={cn(
          "video-cell-video flex-1 min-h-0 min-w-0 w-auto aspect-video",
          statusValue.status === "playing" ? "p-0" : "px-3 pt-3 pb-0",
        )}
      >
        <Suspense key={id} fallback={<VideoSkeleton />}>
          <PlayerWrapper id={id} url={idToVideoURL(id)} autoplay={false} />
        </Suspense>
      </div>
      <VideoCellControl id={id} />
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
