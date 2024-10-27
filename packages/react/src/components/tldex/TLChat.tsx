import { useSocket } from "@/hooks/useSocket";
import { formatDuration } from "@/lib/time";
import { cn, getChannelPhoto } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { playerRefAtom } from "@/store/player";
import { tldexBlockedAtom, tldexSettingsAtom } from "@/store/tldex";
import { useAtom, useAtomValue } from "jotai";
import { DetailedHTMLProps, HTMLAttributes, forwardRef, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import "./tlchat.css";

interface TLChatProps {
  videoId: string;
}

export function TLChat({ videoId }: TLChatProps) {
  const tldexState = useAtomValue(tldexSettingsAtom);
  const roomID = useMemo(
    () => `${videoId}/${tldexState.liveTlLang}` as RoomIDString,
    [videoId, tldexState.liveTlLang],
  );
  const { chatDB } = useSocket(roomID);

  const processedMessages = useMemo(() => {
    return chatDB.messages?.map((msg, i, arr) => ({
      ...msg,
      showHeader:
        i === 0 || // This condition checks if the current message is the first one in the array.
        arr[i - 1]?.name !== msg.name || // This condition checks if the previous message's name is different from the current message's name.
        (i > 5 && arr[i - 5]?.name === msg.name), // This condition checks if the message 5 positions back in the array has the same name as the current message
    }));
  }, [chatDB.messages]);

  return (
    <Virtuoso
      components={{ Item: TLChatItem }}
      className="h-full w-full bg-base-2 py-2"
      initialTopMostItemIndex={{ index: "LAST", align: "end" }}
      // firstItemIndex={chatDB.messages?.length ? 30 : 0}
      alignToBottom
      followOutput="smooth"
      startReached={() => chatDB.loadMessages({ partial: 30 })}
      data={processedMessages}
      itemContent={(_, { key, ...message }) => (
        <TLChatMessage {...message} key={key} />
      )}
    />
  );
}

const TLChatItem = forwardRef<
  HTMLDivElement,
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>((props, ref) => (
  <div
    {...props}
    className={cn(props.className, "border-b-0 border-base-4 last:border-b-0")}
    ref={ref}
  />
));

function TLChatMessage({
  message,
  parsed,
  name,
  video_offset,
  is_owner,
  is_verified,
  is_vtuber,
  is_moderator,
  channel_id,
  showHeader,
}: ParsedMessage & { showHeader?: boolean }) {
  const playerRef = useAtomValue(playerRefAtom);
  const [blocked, setBlocked] = useAtom(tldexBlockedAtom);
  if (blocked.includes(name)) return null;
  return (
    <div
      className="flex flex-col p-1 px-2 hover:cursor-pointer hover:bg-base-4"
      onClick={() => playerRef?.seekTo(video_offset, "seconds")}
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
                  className="border-base px-1 py-0.5 text-[0.6rem] text-base-11"
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
            <span className="line-clamp-1 whitespace-nowrap text-sm">
              {name}
              {is_verified && <span className="ml-2">✓</span>}
            </span>
          </div>
        </div>
      )}
      <div className="break-words">
        <span className="mr-2 whitespace-nowrap text-xs text-base-11">
          {formatDuration(video_offset * 1000)}
        </span>
        {parsed ? (
          <span
            // eslint-disable-next-line tailwindcss/no-custom-classname
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
