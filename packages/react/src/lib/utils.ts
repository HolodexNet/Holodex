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

type Nullish = null | undefined;

type NonNullishProperties<T> = {
  [K in keyof T]: T[K] extends Nullish ? never : K;
}[keyof T];

type OmitNullish<T> = Pick<T, NonNullishProperties<T>>;

export function omitNullish<T extends object>(obj: T): OmitNullish<T> {
  const result = {} as OmitNullish<T>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        // This assertion is safe because we've checked that the value is not nullish
        (result as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  return result;
}

/**
 * Generates an array of page numbers for pagination navigation.
 * The array includes the current page and surrounding pages, with ellipsis (-1)
 * where pages are skipped. Always includes first and last pages.
 *
 * Example outputs:
 * - For 3 total pages: [1, 2, 3]
 * - For current page 1 of 10: [1, 2, 3, -1, 10]
 * - For current page 5 of 10: [1, -1, 4, 5, 6, -1, 10]
 * - For current page 10 of 10: [1, -1, 8, 9, 10]
 *
 * @param currentPage - The currently active page number (1-based)
 * @param totalPages - The total number of pages available
 * @param maxPagesToShow - Maximum number of page numbers to display (default: 5)
 * @returns Array of page numbers, with -1 representing ellipsis
 * @throws Error if currentPage or totalPages are less than 1
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxPagesToShow: number = 5,
): number[] {
  // Input validation
  if (currentPage < 1 || totalPages < 1) {
    throw new Error("Current page and total pages must be greater than 0");
  }
  if (currentPage > totalPages) {
    throw new Error("Current page cannot be greater than total pages");
  }

  const pages: number[] = [];

  // Case 1: Show all pages if total is less than or equal to max
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Case 2: Need to show selective pages with possible ellipsis
  // Always show first page
  pages.push(1);

  // Add leading ellipsis if current page is far from start
  if (currentPage > 3) {
    pages.push(-1);
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add trailing ellipsis if current page is far from end
  if (currentPage < totalPages - 2) {
    pages.push(-1);
  }

  // Always show last page
  if (pages[pages.length - 1] !== totalPages) {
    pages.push(totalPages);
  }

  return pages;
}

export default generatePageNumbers;
