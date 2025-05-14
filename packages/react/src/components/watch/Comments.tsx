import React, { useState, useMemo, useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { videoPlayerRefAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

interface CommentData {
  message: string;
  comment_key: string;
}

interface TruncatedTextProps {
  text: string;
}

const TruncatedText = ({ text }: TruncatedTextProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClamped, setClamped] = useState(false);

  useEffect(() => {
    if (contentRef && contentRef.current) {
      setClamped(
        contentRef.current.scrollHeight > contentRef.current.clientHeight + 2, // so i'm not too sure why but there's a 2px offset on my computer between the client height and the scrollheight.
      );
    }
  }, []);

  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        ref={contentRef}
        className={`whitespace-pre-wrap break-words ${!expanded ? `line-clamp-5` : ""}`}
      >
        <span dangerouslySetInnerHTML={{ __html: text }} />
      </div>
      {isClamped && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-base-11 mt-1 hover:text-base-12"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

const parseTimestamps = (message: string, videoId: string) => {
  const decoder = document.createElement("div");
  decoder.innerHTML = message;
  const sanitizedText = decoder.textContent || "";

  return sanitizedText.replace(
    /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm,
    (match, hr, min, sec) => {
      const seconds = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
      return `<a href="/watch/${videoId}?t=${seconds}" data-time="${seconds}" class="inline-block rounded px-1 text-primary-11 hover:bg-primary hover:text-primary-12">${match}</a>`;
    },
  );
};

const Comment = ({
  comment,
  videoId,
}: {
  comment: CommentData;
  videoId: string;
}) => {
  const parsedMessage = useMemo(
    () => parseTimestamps(comment.message, videoId),
    [comment.message, videoId],
  );

  return (
    <div className="group relative border-l-2 border-base-6 px-4 py-1 my-3 min-h-0">
      <TruncatedText text={parsedMessage} />
      <a
        href={`https://www.youtube.com/watch?v=${videoId}&lc=${comment.comment_key}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-0 hidden text-base-11 hover:text-base-12 right-0 group-hover:block"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
};

export const Comments = ({ video }: { video?: PlaceholderVideo }) => {
  const playerRefAtom = videoPlayerRefAtomFamily(
    video?.id || "__nonexistent__",
  );
  const player = useAtomValue(playerRefAtom);
  const goToTimestampHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.target instanceof HTMLAnchorElement) {
      if (e.target.dataset.time) {
        console.log(e.target.dataset.time, player);
        player?.seekTo(+e.target.dataset.time, "seconds");
        player?.getInternalPlayer().playVideo?.();
        e.preventDefault();
      }
    }
  };

  if (!video?.comments?.length) return null;
  return (
    <div
      className="space-y-2"
      onClick={
        goToTimestampHandler as unknown as React.MouseEventHandler<HTMLDivElement>
      }
    >
      {video.comments.map((comment) => (
        <Comment
          key={comment.comment_key}
          comment={comment}
          videoId={video.id}
        />
      ))}
    </div>
  );
};

export default Comments;
