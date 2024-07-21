import { getChannelPhoto } from "./utils";

/**
 * Generates a thumbnail URL for a given image URL and resolution definition.
 * If the provided URL does not start with "http", the original URL is returned.
 * Otherwise, the URL is encoded and formatted according to the specified definition.
 *
 * @param imgUrl The original image URL.
 * @param definition The desired resolution of the thumbnail. Can be "maxres" or "default".
 * @returns A string representing the formatted thumbnail URL or the original URL.
 */
export function getThumbnailUrl(
  imgUrl: string,
  definition: "maxres" | "default",
) {
  // Check if imgUrl starts with "http", indicating it's an external URL
  if (imgUrl.startsWith("http") === false) {
    return imgUrl; // Return the original URL if it's not an external URL
  }
  // Encode the URL and replace characters to make it URL-safe
  const encodedUrl = btoa(imgUrl)
    .replace("+", "-")
    .replace("/", "_")
    .replace(/=+$/, ""); // Remove any trailing '=' characters

  return `/statics/thumbnail/${definition}/${encodedUrl}.jpg`;
}

type MaybeUndefined<T extends string> = T | undefined;
type NullIfUndefined<T extends string> = T extends undefined ? null : T;

export function getThumbnailForOrg<T extends string>(
  orgIcon: MaybeUndefined<T>,
): NullIfUndefined<T> {
  if (!orgIcon) return null as NullIfUndefined<T>;

  if (orgIcon.startsWith("UC")) {
    // it's a channel icon:
    return getChannelPhoto(orgIcon, 20) as NullIfUndefined<T>;
  }

  return getThumbnailUrl(orgIcon, "default") as NullIfUndefined<T>;
}
