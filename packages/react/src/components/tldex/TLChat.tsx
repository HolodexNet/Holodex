import { useSocket } from "@/hooks/useSocket";
import { formatDuration } from "@/lib/time";
import { cn, getChannelPhoto } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import {
  videoPlayerRefAtomFamily,
  videoStatusAtomFamily,
} from "@/store/player";
import { tldexBlockedAtom, tldexSettingsAtom } from "@/store/tldex";
import { getDefaultStore, useAtom, useAtomValue } from "jotai";
import { HTMLAttributes, useEffect, useMemo, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import "./tlchat.css";
import React from "react";
import ReactPlayer from "react-player";

interface TLChatProps {
  videoId: string;
}
/**
 * Returns a memoized function that takes a target timestamp and returns the
 * index of the closest message in the given array of messages. If the array is
 * empty, returns 0. If the target timestamp is before the first message, returns
 * 0. If the target timestamp is after the last message, returns the last index.
 * Otherwise, performs a binary search to find the closest match.
 * @param messages - The array of messages to search
 * @returns A function that takes a target timestamp and returns the index of the
 * closest message
 */
function useTimestampIndex(messages?: ParsedMessage[]) {
  // Build and memoize the timestamp index
  return useMemo(() => {
    const findIndexForTimestamp = (targetTimestamp: number) => {
      if (!messages) return undefined;

      let left = 0;
      let right = messages.length - 1;

      // Handle edge cases
      if (right < 0) return 0;
      if (targetTimestamp <= messages[0].video_offset) return 0;
      if (targetTimestamp >= messages[right].video_offset) return right;

      // Binary search for closest match
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midTimestamp = messages[mid].video_offset;

        if (midTimestamp === targetTimestamp) {
          return mid;
        }

        if (midTimestamp < targetTimestamp) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Find closest between the two surrounding values
      return messages[right].video_offset <= targetTimestamp ? right : left;
    };

    return findIndexForTimestamp;
  }, [messages]);
}

/**
 * Subscribe to video status updates outside of React and scroll the virtuoso
 * component to the index that is closest to the video's current progress.
 *
 * @param videoId The video ID to subscribe to.
 * @param indexFinder A function that given a timestamp, returns the index of the
 * message that is closest to it.
 * @param virtuosoRef A ref to the Virtuoso component.
 * @returns A subscription that will be called when the video status changes.
 */
function scrollToVideoProgress(
  videoId: string,
  indexFinder: (targetTimestamp: number) => number | undefined,
  virtuosoRef: React.RefObject<VirtuosoHandle | null>,
) {
  const videoStatusAtom = videoStatusAtomFamily(videoId);
  const store = getDefaultStore();
  return store.sub(videoStatusAtom, () => {
    const videoStatus = store.get(videoStatusAtom);
    if (virtuosoRef.current && videoStatus?.progress !== undefined) {
      const index = indexFinder(videoStatus.progress);
      virtuosoRef.current?.scrollToIndex({
        index: index ?? "LAST",
        align: "end",
      });
    }
  });
}

export function TLChat({ videoId }: TLChatProps) {
  const tldexState = useAtomValue(tldexSettingsAtom);
  const roomID = useMemo(
    () => `${videoId}/${tldexState.liveTlLang}` as RoomIDString,
    [videoId, tldexState.liveTlLang],
  );
  const { chatDB } = useSocket(roomID);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const processedMessages = useMemo(() => {
    return chatDB.messages?.map((msg, i, arr) => ({
      ...msg,
      showHeader:
        i === 0 || // This condition checks if the current message is the first one in the array.
        arr[i - 1]?.name !== msg.name || // This condition checks if the previous message's name is different from the current message's name.
        (i > 5 && arr[i - 5]?.name === msg.name), // This condition checks if the message 5 positions back in the array has the same name as the current message
    }));
  }, [chatDB.messages]);
  const playerRef = useAtomValue(videoPlayerRefAtomFamily(videoId));

  // inverse index of timestamp to index of message
  const findIndexForTimestamp = useTimestampIndex(processedMessages);

  useEffect(() => {
    // Set up subscription
    const unsubscribe = scrollToVideoProgress(
      videoId,
      findIndexForTimestamp,
      virtuosoRef,
    );

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [videoId, findIndexForTimestamp]);

  return (
    <Virtuoso
      ref={virtuosoRef}
      components={{ Item: TLChatItem }}
      className="h-full w-full bg-base-2 py-2"
      initialTopMostItemIndex={{ index: "LAST", align: "end" }}
      // firstItemIndex={chatDB.messages?.length ? 30 : 0}
      alignToBottom
      followOutput="smooth"
      startReached={() => chatDB.loadMessages({ partial: 30 })}
      data={processedMessages}
      itemContent={(_, { key, ...message }) => (
        <TLChatMessage {...message} key={key} player={playerRef} />
      )}
    />
  );
}

const TLChatItem = (
  props: React.DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >,
) => (
  <div
    {...props}
    className={cn(props.className, "border-b-0 border-base-4 last:border-b-0")}
  />
);

function TLChatMessage({
  message,
  parsed,
  name,
  video_offset,
  duration,
  is_owner,
  is_verified,
  is_vtuber,
  is_moderator,
  channel_id,
  showHeader,
  video_id,
  player,
}: ParsedMessage & { showHeader?: boolean; player: ReactPlayer | null }) {
  const [blocked, setBlocked] = useAtom(tldexBlockedAtom);
  const { progress } = useAtomValue(videoStatusAtomFamily(video_id || ""));
  // highlighted:
  const highlighted =
    video_offset < progress &&
    progress < video_offset + (duration ? duration / 1000 : 5000);
  if (blocked.includes(name)) return null;
  return (
    <div
      className={cn(
        "flex flex-col p-1 px-2 hover:cursor-pointer hover:bg-base-4",
        highlighted && "bg-primary-4 hover:bg-primary-5",
      )}
      onClick={() => {
        player?.seekTo(video_offset, "seconds");
        player?.getInternalPlayer()?.playVideo();
      }}
    >
      {showHeader && (
        <div
          className={cn("group flex items-center gap-2 text-base-11", {
            "text-primary": is_owner,
            "text-secondary":
              !is_owner && (is_verified || is_moderator || is_vtuber),
          })}
        >
          {is_vtuber && channel_id && (
            <img
              className="h-8 w-8 rounded-full"
              src={getChannelPhoto(channel_id, 28)}
            />
          )}
          <div className="flex flex-col">
            <div className="flex gap-1">
              {is_vtuber && (
                <Badge
                  size="sm"
                  variant="outline"
                  className="border-base text-base-11 px-1 py-0.5 text-[0.6rem]"
                >
                  VTuber
                </Badge>
              )}
              {is_moderator && (
                <Badge
                  size="sm"
                  variant="outline"
                  className="border-base px-1 py-0.5 text-[0.6rem] text-base-11"
                >
                  Mod
                </Badge>
              )}
            </div>
            <span className="line-clamp-1 text-sm whitespace-nowrap">
              {name}
              {is_verified && (
                <span className="ml-2" title="verified">
                  ✓
                </span>
              )}
            </span>
          </div>
        </div>
      )}
      <div className="break-words">
        <span className="whitespace-nowrap text-xs text-base-11 mr-2">
          {formatDuration(video_offset * 1000)}
        </span>
        {parsed ? (
          <span
            className="tlmsg"
            dangerouslySetInnerHTML={{ __html: parsed }}
          />
        ) : (
          message
        )}
      </div>
    </div>
  );
}

/**!SECTION
 * 
 * 
 *         <PopoverContent>
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-base-12">{name}</span>
            {channel_id && (
              <Button className="w-full bg-red hover:bg-red-8" asChild>
                <Link
                  to={`https://www.youtube.com/channel/${channel_id}`}
                  target="_blank"
                >
                  <div className="i-mdi:youtube" />
                  YouTube
                </Link>
              </Button>
            )}
            {channel_id && is_vtuber && (
              <Button className="w-full" asChild>
                <Link to={`/channel/${channel_id}`}>
                  <div className="" />
                  Holodex
                </Link>
              </Button>
            )}
            <Button
              className="w-full bg-orange hover:bg-orange-8"
              onClick={() =>
                setBlocked((prev) =>
                  isBlocked
                    ? prev.filter((channel) => name !== channel)
                    : [...prev, name],
                )
              }
            >
              {isBlocked ? "Unblock" : "Block"}
            </Button>
          </div>
        </PopoverContent>
 */
