/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { usePreferredName } from "@/store/settings";
import { LiveChannelIcon } from "./LiveChannelIcon";
import { LiveStreamInfo } from "./LiveStreamInfo";
import { useState } from "react";

interface LiveChannelProps {
  topicId?: string;
  videoId?: string;
  channel: ShortChannel;
  title?: string;
}

export function LiveChannel({
  topicId,
  videoId,
  channel,
  title,
}: LiveChannelProps) {
  const [isHover, setIsHover] = useState(false);
  const preferredName = usePreferredName({
    name: channel.name,
    english_name: channel.english_name,
  });

  // TODO: move live stream info card outside of this components
  return (
    <div>
      <LiveChannelIcon
        imageLink={channel.photo}
        channelName={channel.name}
        setIsHover={setIsHover}
      />
      {/* <LiveStreamInfo
        videoId={videoId}
        altText={`${channel.name} streaming ${title}`}
        title={title}
        channelName={preferredName}
        topicId={topicId}
        isVisible={isHover}
      /> */}
    </div>
  );
}
