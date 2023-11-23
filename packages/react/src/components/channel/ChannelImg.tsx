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
      className={cn("rounded-full shrink-0", className)}
      src={getChannelPhoto(channelId, size)}
    />
  );
}
