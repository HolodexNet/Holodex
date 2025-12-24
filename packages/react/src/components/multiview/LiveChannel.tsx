// import { useChannel } from "@/services/channel.service";
import { LiveChannelIcon } from "./LiveChannelIcon";
import { LiveStreamInfo } from "./LiveStreamInfo";
import { useState } from "react";
import { useAutoLayout } from "@/hooks/useAutoLayout";

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
  const { addVideo } = useAutoLayout();

  const handleClick = () => {
    if (videoId) {
      addVideo({ id: videoId });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer"
      title={`Add ${channelName} to multiview`}
    >
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
