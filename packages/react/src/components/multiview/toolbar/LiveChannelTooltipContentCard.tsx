import { VideoCardCountdownToLive } from "@/components/video/VideoCardCountdownToLive";
import { VideoThumbnail } from "@/components/video/VideoThumbnail";
import { cn } from "@/lib/utils";
import React from "react";

export const MemoizedLiveChannelTooltipContentCard = React.memo(
  LiveChannelTooltipContentCard,
);

export function LiveChannelTooltipContentCard({
  video,
  thumbnail,
  preferredName,
}: {
  video: VideoBase;
  thumbnail: string | string[];
  preferredName: string | undefined;
}) {
  return (
    <>
      <div className={cn("group z-20 flex w-full flex-col gap-4")}>
        <div className="relative">
          <VideoThumbnail
            src={thumbnail}
            alt={video.title}
            className="aspect-video"
          />
          {video.topic_id && (
            <span className="absolute left-1 top-1 text-pretty rounded-sm bg-black/80 px-1 text-sm capitalize text-white/80 group-hover:text-white">
              {video.topic_id.replaceAll("_", " ")}
            </span>
          )}
        </div>
        <div className="flex min-h-[6rem] cursor-pointer flex-col gap-0">
          <div className=" line-clamp-2 w-full pr-4 text-sm font-bold md:text-[1rem] md:leading-6">
            {video.title}
          </div>
          <div className="line-clamp-1 text-sm text-primary-11 hover:text-primary-12 @lg:text-sm">
            {preferredName}
          </div>
          <div className="flex-end">
            <VideoCardCountdownToLive video={video} onlyTime={true} />
          </div>
        </div>
      </div>
    </>
  );
}
