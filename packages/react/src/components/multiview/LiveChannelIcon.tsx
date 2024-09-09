import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar";
import { Dispatch, SetStateAction } from "react";

interface LiveChannelIconProps {
  imageLink?: string;
  channelName?: string;
  setIsHover: Dispatch<SetStateAction<boolean>>;
}

export function LiveChannelIcon({
  imageLink,
  channelName,
  setIsHover,
}: LiveChannelIconProps) {
  return (
    <div
      draggable="true"
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
}: LiveChannelIconProps) {
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
