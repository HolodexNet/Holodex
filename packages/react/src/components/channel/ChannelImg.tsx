import { cn, getChannelPhoto } from "@/lib/utils";
import { useState } from "react";

export function ChannelImg({
  channelId,
  photo,
  fallbackPhoto,
  size = 100,
  className,
}: {
  channelId: string;
  size?: number;
  photo?: string; // photo for non-fallback
  className?: string;
  fallbackPhoto?: string; // photo for fallback.
}) {
  const [err, hasError] = useState(false);
  if (err) {
    return (
      <img
        loading="lazy"
        className={cn("shrink-0 rounded-full", className)}
        src={fallbackPhoto || `/statics/channelImg/${channelId}.png`}
      />
    );
  }
  return (
    <img
      loading="lazy"
      className={cn("shrink-0 rounded-full", className)}
      src={photo || getChannelPhoto(channelId, size)}
      onError={() => {
        hasError(true);
      }}
    />
  );
}
