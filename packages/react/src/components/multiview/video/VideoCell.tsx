import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { Suspense } from "react";

interface VideoCellProps {
  video: VideoBase;
}

export function VideoCell({ video }: VideoCellProps) {
  return (
    <div>
      <Suspense key={video.id} fallback={<VideoSkeleton />}>
        <PlayerWrapper
          id={video.id}
          url={idToVideoURL(video.id)}
          autoplay={false}
        />
      </Suspense>
      <div className="w-full flex align-middle justify-center">
        Bar for buttons
      </div>
    </div>
  );
}

const VideoSkeleton = () => (
  <div
    className="w-full flex justify-center bg-gray-800 items-center border border-gray-600"
    style={{ aspectRatio: "16 / 9" }}
  >
    <div className="text-white text-sm">Loading video...</div>
  </div>
);
