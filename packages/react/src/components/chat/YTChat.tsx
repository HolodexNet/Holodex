import { darkAtom } from "@/hooks/useTheme";
import { replayReloadContinuation } from "@/lib/ytChatTokenGen";
import { videoStatusAtomFamily } from "@/store/player";
import { getDefaultStore, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
interface YTChatProps {
  id: string;
  status: VideoStatus;
  channelId?: string;
}

// Keep track of chat iframes to publish to
const chatIframeRefs = new Map<string, HTMLIFrameElement>();

// Subscribe to video status updates outside of React
function subscribeToVideoProgress(videoId: string) {
  const videoStatusAtom = videoStatusAtomFamily(videoId);
  const store = getDefaultStore();
  return store.sub(videoStatusAtom, () => {
    const videoStatus = store.get(videoStatusAtom);
    const iframe = chatIframeRefs.get(videoId);
    if (iframe?.contentWindow && videoStatus?.progress !== undefined) {
      iframe.contentWindow.postMessage(
        { "yt-player-video-progress": videoStatus.progress },
        "*",
      );
    }
  });
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

  // const videoStatus = useAtomValue(videoStatusAtomFamily(id));

  useEffect(() => {
    if (!ref.current || !isArchive || !channelId) return;

    // Store ref in map
    chatIframeRefs.set(id, ref.current);

    // Initialize progress
    ref.current.contentWindow?.postMessage(
      { "yt-player-video-progress": 0 },
      "*",
    );

    // Set up subscription
    const unsubscribe = subscribeToVideoProgress(id);

    // Cleanup
    return () => {
      unsubscribe();
      chatIframeRefs.delete(id);
    };
  }, [id, isArchive, channelId]);

  return (
    <iframe
      className="flex grow"
      key={src}
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
