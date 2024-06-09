import { useSocket } from "@/hooks/useSocket";
import { formatDuration } from "@/lib/time";
import { cn, getChannelPhoto } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { playerRefAtom } from "@/store/player";
import { tldexBlockedAtom, tldexSettngsAtom } from "@/store/tldex";
import { useAtom, useAtomValue } from "jotai";
import { DetailedHTMLProps, HTMLAttributes, forwardRef } from "react";
import { Link } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

interface TLChatProps {
  videoId: string;
}

export function TLChat({ videoId }: TLChatProps) {
  const tldexState = useAtomValue(tldexSettngsAtom);
  const roomID: RoomIDString = `${videoId}/${tldexState.liveTlLang}`;
  const { chatDB } = useSocket(roomID);

  return (
    <Virtuoso
      components={{ Item: TLChatItem }}
      className="h-full w-full bg-base-2 py-2"
      initialTopMostItemIndex={{ index: "LAST", align: "end" }}
      // firstItemIndex={chatDB.messages?.length ? 30 : 0}
      alignToBottom
      followOutput="smooth"
      startReached={() => chatDB.loadMessages({ partial: 30 })}
      data={chatDB.messages}
      itemContent={(_, message) => <TLChatMessage {...message} />}
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
}: ParsedMessage) {
  const playerRef = useAtomValue(playerRefAtom);
  const [blocked, setBlocked] = useAtom(tldexBlockedAtom);
  const isBlocked = blocked.includes(name);

  return (
    <div
      className="flex flex-col p-1 px-2 hover:cursor-pointer hover:bg-base-4"
      onClick={() => playerRef?.seekTo(video_offset, "seconds")}
    >
      <Popover>
        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className={cn("group flex items-center gap-2 text-base-11", {
              "text-primary": is_owner,
              "text-secondary": is_verified || is_moderator || is_vtuber,
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
                    className="py-1/2 border-base px-1 text-[0.6rem] text-base-11"
                  >
                    VTuber
                  </Badge>
                )}
                {is_moderator && (
                  <Badge
                    size="sm"
                    variant="outline"
                    className="py-1/2 border-base px-1 text-[0.6rem] text-base-11"
                  >
                    Moderator
                  </Badge>
                )}
              </div>
              <span className="line-clamp-1 whitespace-nowrap text-sm group-hover:underline">
                {name}
                {is_verified && <span className="ml-2">✓</span>}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent>
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
      </Popover>
      <div className="break-words">
        <span className="mr-2 whitespace-nowrap text-xs text-base-11">
          {formatDuration(video_offset * 1000)}
        </span>
        {parsed ? (
          <span dangerouslySetInnerHTML={{ __html: parsed }} />
        ) : (
          message
        )}
      </div>
    </div>
  );
}
