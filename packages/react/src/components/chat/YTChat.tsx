import { darkAtom } from "@/hooks/useTheme";
import { replayReloadContinuation } from "@/lib/ytChatTokenGen";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";

interface YTChatProps {
  id: string;
  status: VideoStatus;
  channelId?: string;
}

export function YTChat({ id, status, channelId }: YTChatProps) {
  const dark = useAtomValue(darkAtom);
  const ref = useRef<HTMLIFrameElement>(null);
  const isArchive = status === "past";
  const q = new URLSearchParams({
    v: id,
    embed_domain: window.location.hostname,
    dark_theme: dark ? "1" : "0",
    ...(isArchive &&
      channelId && {
        continuation: replayReloadContinuation({
          videoId: id,
          channelId: channelId!,
        }),
      }),
  }).toString();
  const src = isArchive
    ? `https://www.youtube.com/live_chat_replay?${q}`
    : `https://www.youtube.com/live_chat?${q}`;

  const videoStatus = useAtomValue(videoStatusAtomFamily(id));

  useEffect(() => {
    if (
      isArchive &&
      channelId &&
      ref.current?.contentWindow &&
      videoStatus?.progress !== undefined
    ) {
      ref.current.contentWindow.postMessage(
        { "yt-player-video-progress": videoStatus.progress },
        "*",
      );
    }
  }, [isArchive, channelId, videoStatus?.progress]);

  return (
    <iframe
      className="flex grow"
      key={src} // prevent push history
      ref={ref}
      src={src}
      onLoad={() => {
        if (isArchive && channelId)
          ref.current?.contentWindow?.postMessage(
            { "yt-player-video-progress": 0 },
            "*",
          );
      }}
    />
  );
}
