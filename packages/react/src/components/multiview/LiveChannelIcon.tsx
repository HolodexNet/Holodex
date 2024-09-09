import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";

interface LiveChannelIconProps {
  imageLink?: string;
  channelName?: string;
}

export function LiveChannelIcon({
  imageLink,
  channelName,
}: LiveChannelIconProps) {
  return (
    <div draggable="true" className="relative">
      <Avatar className="size-12">
        <AvatarImage src={imageLink} alt={`${channelName} user icon`} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="absolute bottom-0 right-0 bg-red text-xs text-white">
        12hr
      </div>
    </div>
  );
}
