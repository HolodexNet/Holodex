import type {
  Autocomplete,
  Channel,
  Organization,
  SearchResponse,
  Video,
  VideoPage,
} from "./types";

const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  signal?: AbortSignal,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (import.meta.env.VITE_API_KEY)
    headers["X-APIKEY"] = import.meta.env.VITE_API_KEY;
  const response = await fetch(`${base}${path}`, {
    signal,
    headers,
    method: body === undefined ? "GET" : "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: "Your session has expired.",
      403: "The API rejected this connection. Check the API origin or API key configuration.",
      404: "This item is no longer available.",
      429: "Too many requests. Please wait a moment before trying again.",
    };
    throw new ApiError(
      response.status,
      messages[response.status] ||
        "Holodex could not load this data. Please try again.",
    );
  }
  if (!response.headers.get("content-type")?.includes("json"))
    throw new Error(
      "The API returned an unexpected response. Check the backend URL.",
    );
  return response.json() as Promise<T>;
}
function query(params: Record<string, string | number | undefined>) {
  return new URLSearchParams(
    Object.entries(params)
      .filter((entry) => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );
}
export const api = {
  orgs: (signal?: AbortSignal) =>
    request<Organization[]>("/statics/orgs.json", signal),
  live: (org: string, signal?: AbortSignal) =>
    request<VideoPage>(
      `/v3/live?${query({ org: org === "all" ? undefined : org, limit: 500, type: "stream,placeholder", include: "live_info,mentions", max_upcoming_hours: 48 })}`,
      signal,
    ),
  favoriteLive: async (
    channels: string[],
    signal?: AbortSignal,
  ): Promise<VideoPage> => {
    // v3 uploader filtering has a documented backend limitation. This v2 route
    // accepts explicit IDs and works without an account. Never send an empty list.
    if (!channels.length) return { items: [] };
    const response = await request<Video[] | VideoPage>(
      `/v2/users/live?${query({ channels: channels.join(","), includePlaceholder: 1 })}`,
      signal,
    );
    return Array.isArray(response) ? { items: response } : response;
  },
  favoriteVideos: async (
    channels: string[],
    type: string,
    lang: string,
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<VideoPage> => {
    if (!channels.length) return { items: [] };
    const response = await request<SearchResponse>(
      "/v3/search/videoSearch",
      signal,
      {
        q: {
          search: "",
          vtuber: channels,
          type: [type],
          lang: lang === "all" ? undefined : [lang],
          to: Date.now(),
        },
        sort: "latest",
        limit: 24,
        offset: 0,
        search_after: cursor ? JSON.parse(cursor) : undefined,
      },
    );
    const hits = response.hits.hits;
    return {
      items: hits.map((hit) => ({
        ...hit._source,
        id: hit._source.id || hit._id,
      })),
      nextPage:
        hits.length === 24 && hits.at(-1)?.sort
          ? JSON.stringify(hits.at(-1)!.sort)
          : undefined,
    };
  },
  videos: (
    params: Record<string, string | number | undefined>,
    signal?: AbortSignal,
  ) =>
    request<VideoPage>(
      `/v3/videos?${query({ limit: 24, include: "mentions", ...params })}`,
      signal,
    ),
  video: (id: string, signal?: AbortSignal) =>
    request<Video>(`/v3/videos/${encodeURIComponent(id)}`, signal),
  search: (body: unknown, signal?: AbortSignal) =>
    request<SearchResponse>("/v3/search/videoSearch", signal, body),
  autocomplete: (q: string, signal?: AbortSignal) =>
    request<Autocomplete>(
      `/v3/search/autocomplete?${query({ q, n: 5 })}`,
      signal,
    ),
  channels: (org: string, offset: number, signal?: AbortSignal) =>
    request<Channel[]>(
      `/v2/channels?${query({ type: "vtuber", org: org === "all" ? undefined : org, limit: 48, offset, sort: "subscriber_count", order: "desc" })}`,
      signal,
    ),
};
export function avatar(channel: Channel) {
  return (
    channel.photo ||
    `${base}/statics/channelImg/${encodeURIComponent(channel.id)}/100.png`
  );
}
export function isPlayable(video: Video) {
  return (
    /^[\w-]{11}$/.test(video.id) &&
    !video.type.includes("placeholder") &&
    (!video.platform || video.platform === "youtube")
  );
}
export function watchUrl(video: Video) {
  if (isPlayable(video)) return `https://www.youtube.com/watch?v=${video.id}`;
  try {
    const url = new URL(video.link || "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
