import { darkAtom } from "@/hooks/useTheme";
import { useAtomValue } from "jotai";
import { useRef } from "react";

interface YTChatProps {
  id: string;
  status: VideoStatus;
  channelId?: string;
  currentTime?: number;
}

export function YTChat({ id, status, channelId, currentTime }: YTChatProps) {
  const dark = useAtomValue(darkAtom);
  const ref = useRef<HTMLIFrameElement>(null);
  const isArchive = status === "past";
  const q = new URLSearchParams({
    v: id,
    embed_domain: window.location.hostname,
    dark_theme: dark ? "1" : "0",
    ...(isArchive && { c: channelId }),
  }).toString();
  const src = isArchive
    ? `https://www.youtube.com/redirect_replay_chat?${q}`
    : `https://www.youtube.com/live_chat?${q}`;

  return (
    <iframe
      className="flex grow rounded-lg"
      key={src} // prevent push history
      ref={ref}
      src={src}
      onLoad={() => {
        if (isArchive && channelId)
          ref.current?.contentWindow?.postMessage(
            { "yt-player-video-progress": currentTime || 0 },
            "*",
          );
      }}
    />
  );
}
