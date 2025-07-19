import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { Suspense } from "react";

interface VideoCellProps {
  video: VideoBase;
  height?: number;
  width?: number;
}

export function VideoCell({ video, height, width }: VideoCellProps) {
  console.log(height);
  return (
    <div
      className="flex flex-col justify-center"
      style={{
        height: height ? `${height}px` : "100%",
        // padding: "10px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: `auto`,
          height: `calc(${height || 100}px - 20px)`,
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
      <div className="flex justify-center w-full h-[20px] align-middle">
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
