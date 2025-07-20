import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";
import { Suspense, useRef, useState } from "react";
import { VideoCellControl } from "./VideoCellControl";

interface VideoCellProps {
  video: VideoBase;
  height?: number;
  width?: number;
}

export function VideoCell({ video, height, width }: VideoCellProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonHeight, setButtonHeight] = useState(0);

  const videoStatusAtom = videoStatusAtomFamily(video.id || "x");
  const statusValue = useAtomValue(videoStatusAtom);

  // useEffect(() => {
  //   if (buttonRef.current) {
  //     setButtonHeight(buttonRef.current.offsetHeight);
  //   }
  // }, []);

  // const videoHeight =
  //   height && buttonHeight ? height - buttonHeight : undefined;

  return (
    <>
      <div
        className="video-cell-video flex-1"
        style={{
          width: "auto",
          // height: videoHeight ? `${videoHeight}px` : "auto",
          height: "200px",
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
      <VideoCellControl id={video.id} buttonRef={buttonRef} />
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
