interface ChatCellProps {
  videoId: string;
}

/**
 * Chat iframe cell for multiview.
 * Shows YouTube chat for the specified video ID.
 * Now receives videoId directly instead of a tab index.
 */
export function ChatCell({ videoId }: ChatCellProps) {
  if (!videoId) {
    return (
      <div className="bg-base-3 text-base-11 flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="i-lucide:message-square-off mb-2 h-8 w-8 opacity-50" />
          <div className="text-sm">No video assigned to chat</div>
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
