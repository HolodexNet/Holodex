import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Shadcn helper util to join classnames
 * @param inputs - any number of class strings.
 * @returns merged classnames in one string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function makeYtThumbnailUrl(id: string, size: VideoCardSize) {
  switch (size) {
    case "sm":
      return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    case "md":
      return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    case "lg":
    default:
      return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  }
}

export function resizeChannelPhoto(photoUrl: string, size: number) {
  const deviceSize = size; /* * window.devicePixelRatio */
  const split = photoUrl.split("=s");
  // try to hit cache by using a common size
  let adjSize = 48;
  if (deviceSize < 88 && deviceSize > 55) adjSize = 88;
  else if (deviceSize <= 55) adjSize = 48;
  else adjSize = 176;
  return `${split[0]}=s${adjSize}-c-k-c0x00ffffff-no-rj-mo`;
}

export function getChannelPhoto(channelId: string, size = 100) {
  const nearest = Math.min(Math.max(Math.ceil(size / 50) * 50, 50), 150);
  return `/statics/channelImg/${channelId}/${nearest}.png`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait?: number,
  immediate?: boolean,
) {
  let timeout: NodeJS.Timeout | undefined;
  return function (...args: unknown[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      if (!immediate) func.apply({}, args);
    }, wait);
    if (immediate && !timeout) func.apply({}, args);
  };
}
