import { usePreferredName } from "@/store/settings";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { cn, makeThumbnailUrl } from "@/lib/utils";
import { MemoizedLiveChannelTooltipContentCard } from "./LiveChannelTooltipContentCard";
import { compareTimeDiffToNow } from "@/lib/time";
import { addMultiviewVideoAtom } from "@/store/multiview";
import { useAtom } from "jotai";

interface LiveChannelProps {
  video: VideoBase;
}

export function LiveChannel({ video }: LiveChannelProps) {
  const preferredName = usePreferredName({
    name: video.channel.name,
    english_name: video.channel.english_name,
  });

  const thumbnail = makeThumbnailUrl(video.id, "sm");
  const [_, addVideo] = useAtom(addMultiviewVideoAtom);

  // TODO: move live stream info card outside of this components
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            draggable="true"
            className="relative cursor-pointer"
            onClick={() => addVideo(video)}
          >
            <Avatar className="size-12">
              <AvatarImage
                src={video.channel.photo}
                alt={`${preferredName} user icon`}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute bottom-0 right-0 rounded-sm px-0.5 text-xs text-white",
                video.status === "live" ? "bg-red" : "bg-slate-10",
              )}
            >
              {/* if live stream has started, check how long it has been running */}
              {/* if it is less than 1 hour, use the minutes, otherwise, round down to the hour */}
              {video.status === "live"
                ? compareTimeDiffToNow(video.start_actual)
                : compareTimeDiffToNow(video.start_scheduled)}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="mt-2 w-[250px] rounded-md bg-slate-4 px-4 py-2"
        >
          <MemoizedLiveChannelTooltipContentCard
            video={video}
            thumbnail={thumbnail}
            preferredName={preferredName}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
