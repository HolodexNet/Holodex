import { usePreferredName } from "@/store/settings";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { makeThumbnailUrl } from "@/lib/utils";
import { MemoizedLiveChannelTooltipContentCard } from "./LiveChannelTooltipContentCard";

interface LiveChannelProps {
  channel: ShortChannel;
  video: VideoBase;
}

export function LiveChannel({ channel, video }: LiveChannelProps) {
  const preferredName = usePreferredName({
    name: channel.name,
    english_name: channel.english_name,
  });

  const thumbnail = makeThumbnailUrl(video.id, "sm");

  // TODO: move live stream info card outside of this components
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div draggable="true" className="relative cursor-pointer">
            <Avatar className="size-12">
              <AvatarImage
                src={channel.photo}
                alt={`${preferredName} user icon`}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-red text-xs text-white">
              12hr
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
