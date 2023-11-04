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
