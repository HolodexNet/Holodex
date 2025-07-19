import { isSidebarOpenAtom, isMobileAtom } from "@/hooks/useFrame";
import { cn } from "@/lib/utils";
import { readMultiviewVideoAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import { VideoCell } from "./VideoCell";

interface VideoContainerProps {
  isFullScreen?: boolean;
  collapseToolbar?: boolean;
}

export function VideoCellGroup({
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
        <VideoCell key={video.id} video={video} />
      ))}
    </div>
  );
}
