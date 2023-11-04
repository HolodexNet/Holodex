import { useSocket } from "@/hooks/useSocket";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { roomsAtom } from "@/store/chat";
import { tldexStateAtom } from "@/store/tldex";
import { useAtomValue } from "jotai";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  forwardRef,
  useEffect,
} from "react";
import { Virtuoso } from "react-virtuoso";

interface TLChatProps {
  videoId: string;
  isArchive: boolean;
}

export function TLChat({ videoId, isArchive }: TLChatProps) {
  const tldexState = useAtomValue(tldexStateAtom);
  const roomID: RoomIDString = `${videoId}/${tldexState.liveTlLang}`;
  const { chatDB } = useSocket(roomID);
  const { messages } = useAtomValue(roomsAtom(roomID));

  useEffect(() => {
    chatDB.loadMessages(isArchive ? 0 : 30);
  }, []);

  return (
    <Virtuoso
      components={{ Item: TLChatItem }}
      className="h-full w-full py-2"
      initialTopMostItemIndex={{ index: "LAST", align: "end" }}
      alignToBottom
      followOutput
      startReached={() => chatDB.loadMessages(30)}
      data={messages}
      itemContent={(_, { message, name, video_offset }) => (
        <div className="flex flex-col p-1 px-2">
          <span className="line-clamp-1 whitespace-nowrap text-sm text-base-11">
            {name}
          </span>
          <div>
            <span className="mr-2 whitespace-nowrap text-xs text-base-11">
              {formatDuration(video_offset * 1000)}
            </span>
            {message}
          </div>
        </div>
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
    className={cn(props.className, "border-base-4 border-b-2 last:border-b-0")}
    ref={ref}
  />
));
