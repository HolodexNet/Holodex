import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { isSidebarOpenAtom, isMobileAtom } from "@/hooks/useFrame";
import { cn, idToVideoURL } from "@/lib/utils";
import { readMultiviewVideoAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import { Suspense } from "react";

interface VideoContainerProps {
  isFullScreen?: boolean;
  collapseToolbar?: boolean;
}

const VideoSkeleton = () => (
  <div
    className="w-full bg-gray-800 flex items-center justify-center border border-gray-600"
    style={{ aspectRatio: "16 / 9" }}
  >
    <div className="text-white text-sm">Loading video...</div>
  </div>
);

export function VideoContainer({
  isFullScreen = false,
  collapseToolbar,
}: VideoContainerProps) {
  const isSidebarOpen = useAtomValue(isSidebarOpenAtom);
  const isMobile = useAtomValue(isMobileAtom);
  const videos = useAtomValue(readMultiviewVideoAtom);

  return (
    <div
      className={cn(
        "bg-red z-30 relative",
        // isMobile
        //   ? "ml-0"
        //   : isSidebarOpen
        //     ? "ml-[var(--sidebar-width)]"
        //     : "ml-0",
        isSidebarOpen ? "w-[calc(100%-var(--sidebar-width))]" : "w-full",
        isFullScreen
          ? collapseToolbar
            ? "h-full"
            : "h-[calc(100%-var(--toolbar-height))]"
          : collapseToolbar
            ? "h-[calc(100%-var(--header-height))]"
            : "h-[calc(100%-var(--toolbar-height)-var(--header-height))]",
      )}
    >
      {videos.map((video) => (
        <Suspense key={video.id} fallback={<VideoSkeleton />}>
          <PlayerWrapper
            id={video.id}
            url={idToVideoURL(video.id)}
            autoplay={false}
          />
        </Suspense>
      ))}
    </div>
  );
}
