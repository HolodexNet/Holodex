import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VIDEO_URL_REGEX } from "./consts";

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
    case "xs":
      return [
        `https://i.ytimg.com/vi_webp/${id}/default.webp`,
        `https://i.ytimg.com/vi/${id}/default.jpg`,
        `https://i.ytimg.com/vi_webp/${id}/mqdefault.webp`,
        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      ];
    case "list": // same as `sm` behavior.
    case "sm":
      return [
        `https://i.ytimg.com/vi_webp/${id}/mqdefault.webp`,
        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
      ];
    case "md":
      return [
        `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      ];
    case "lg":
      return [
        `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      ];
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

export function getChannelBannerImages(url: string) {
  const base = `${url.split("=")[0]}=`;
  return {
    tablet: `${base}w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
    mobile: `${base}w960-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj`,
    // bannerTabletLowImageUrl:
    //     "w1138-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    banner: `${base}w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
    // bannerTabletHdImageUrl:
    //     "w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    // bannerTabletExtraHdImageUrl:
    //     "w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    // bannerMobileLowImageUrl:
    //     "w320-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
    // bannerMobileMediumHdImageUrl:
    //     "w960-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
    // bannerMobileHdImageUrl:
    //     "w1280-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
    // bannerMobileExtraHdImageUrl:
    //     "w1440-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
    tv: `${base}w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
    // bannerTvLowImageUrl:
    //     "w854-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
    // bannerTvMediumImageUrl:
    //     "w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
    // bannerTvHighImageUrl:
    //     "w1920-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
  };
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

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm: number = decimals < 0 ? 0 : decimals;
  const sizes: string[] = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i: number = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function idToVideoURL(id: string, link?: string) {
  if (id.startsWith("tw:")) {
    // `tw:${event.broadcaster_user_login}:${event.id}`
    return `https://twitch.tv/${id.split(":")[1]}`;
  }
  const url = link?.includes("twitch") ? link : `https://youtu.be/${id}`;
  return url;
}

export function videoURLtoID(url: string) {
  return VIDEO_URL_REGEX.exec(url)?.groups?.id;
}
