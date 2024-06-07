import { cn, getChannelPhoto } from "@/lib/utils";

export function ChannelImg({
  channelId,
  size = 100,
  className,
}: {
  channelId: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      loading="lazy"
      className={cn("shrink-0 rounded-full", className)}
      src={getChannelPhoto(channelId, size)}
    />
  );
}
