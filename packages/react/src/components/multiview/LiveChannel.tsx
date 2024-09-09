// import { useChannel } from "@/services/channel.service";
import { LiveChannelIcon } from "./LiveChannelIcon";
import { LiveStreamInfo } from "./LiveStreamInfo";
import { useState } from "react";

interface LiveChannelProps {
  channelImgLink?: string;
  channelName?: string;
  altText?: string;
  streamTitle?: string;
  topicId?: string;
  videoId?: string;
}

export function LiveChannel({
  channelImgLink,
  channelName,
  altText,
  streamTitle,
  topicId,
  videoId,
}: LiveChannelProps) {
  const [isHover, setIsHover] = useState(false);

  return (
    <div>
      <LiveChannelIcon
        imageLink={channelImgLink}
        channelName={channelName}
        setIsHover={setIsHover}
      />
      <LiveStreamInfo
        thumbnailLink={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
        altText={altText}
        streamTitle={streamTitle}
        channelName={channelName}
        topicId={topicId}
        isVisible={isHover}
      />
    </div>
  );
}
