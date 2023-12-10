import { makeTwitchThumbnailUrl, makeYtThumbnailUrl } from "@/lib/utils";
import React, { useMemo } from "react";

// Shared context about the video that components that rely on a video object can depend on
export const VideoContext = React.createContext<
  (Pick<VideoRef, "id"> & Partial<PlaceholderVideo>) | null
>(null);

function videoToCurrentLink(video: Partial<PlaceholderVideo>) {
  return video.link ?? `/watch/${video.id}`;
}

export function useVideoContext(size: VideoCardSize) {
  const video = React.useContext(VideoContext);

  if (!video) {
    throw new Error("VideoContext not found");
  }

  const videoHref = videoToCurrentLink(video);
  const thumbnailSrc = useMemo(() => {
    if (video.thumbnail) return video.thumbnail;
    switch (video.platform) {
      case "youtube":
        return makeYtThumbnailUrl(video.id, size);
      case "twitch":
        return makeTwitchThumbnailUrl(video.id.split(":")[1], size);
      default:
        return "";
    }
  }, [video.thumbnail, video.platform, video.id, size]);

  const externalLink = useMemo(() => {
    if (video.link) return video.link;
    switch (video.platform) {
      case "youtube":
        return `https://www.youtube.com/watch?v=${video.id}`;
      case "twitch":
        return `https://www.twitch.tv/${video.id.split(":")[1]}`;
      default:
        return "";
    }
  }, [video.link, video.platform, video.id]);

  if (!video) throw new Error("VideoContext not found");

  return {
    video,
    videoHref,
    thumbnailSrc,
    externalLink,
  };
}
