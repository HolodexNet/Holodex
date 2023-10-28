import { TwitchChat } from "./TwitchChat";
import { YTChat } from "./YTChat";

interface LiveChatProps {
  id: string;
  status: VideoStatus;
  channelId: string;
  currentTime?: number;
  link?: string;
}

export function LiveChat({
  id,
  status,
  channelId,
  currentTime,
  link,
}: LiveChatProps) {
  return link?.includes("twitch") ? (
    <TwitchChat link={link} />
  ) : (
    <YTChat
      id={id}
      status={status}
      channelId={channelId}
      currentTime={currentTime}
    />
  );
}
