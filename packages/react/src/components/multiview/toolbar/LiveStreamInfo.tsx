/* eslint-disable @typescript-eslint/no-unused-vars */
import { cn, makeThumbnailUrl } from "@/lib/utils";
import { VideoThumbnail } from "../../video/VideoThumbnail";
import { Badge } from "@/shadcn/ui/badge";

interface LiveStreamInfoProps {
  videoId?: string;
  altText?: string;
  title?: string;
  channelName?: string;
  topicId?: string;
  isVisible: boolean;
}

export function LiveStreamInfo({
  videoId,
  // altText,
  title,
  channelName,
  topicId,
  isVisible,
}: LiveStreamInfoProps) {
  const thumbnail = makeThumbnailUrl(videoId ?? "", "sm");

  return (
    <div
      className={cn(
        // currently hardcoded a translate value, will investigate to find a better way
        " absolute flex max-h-[24rem] w-auto translate-x-[-118px] translate-y-2 flex-col items-center gap-2 rounded-md bg-base-3 p-4 opacity-80",
        {
          visible: isVisible,
          invisible: !isVisible,
        },
      )}
    >
      <div>
        <div className="mt-1 flex flex-wrap justify-center gap-0.5"></div>
        <div className="relative flex w-full flex-col items-center">
          <VideoThumbnail src={thumbnail} alt={title} className="rounded-lg" />
          <Badge
            size="sm"
            variant="outline"
            className="absolute left-1 top-1 text-pretty rounded-sm border-base-7 bg-black/80 px-1 text-sm capitalize "
          >
            {topicId}
          </Badge>
        </div>
        <div>
          <p>{title}</p>
          <p>{channelName}</p>
          <p>status</p>
        </div>
      </div>
    </div>
  );
}
