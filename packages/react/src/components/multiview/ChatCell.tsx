import { activeVideosAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

interface ChatCellProps {
  chatTab: number;
}

/**
 * Chat iframe cell for multiview.
 * Shows YouTube chat for the video at the specified tab index.
 */
export function ChatCell({ chatTab }: ChatCellProps) {
  const activeVideos = useAtomValue(activeVideosAtom);

  // Get video ID from tab index
  const videoId = useMemo(() => {
    if (chatTab >= 0 && chatTab < activeVideos.length) {
      return activeVideos[chatTab].videoId;
    }
    return null;
  }, [activeVideos, chatTab]);

  if (!videoId) {
    return (
      <div className="bg-base-3 text-base-11 flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="i-lucide:message-square-off mb-2 h-8 w-8 opacity-50" />
          <div className="text-sm">No video for tab {chatTab}</div>
        </div>
      </div>
    );
  }

  // YouTube chat embed URL
  const chatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`;

  return (
    <div className="bg-base-1 h-full w-full">
      <iframe
        src={chatUrl}
        className="h-full w-full border-0"
        title={`Chat for ${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
