import type { FetchClient } from "@/lib/fetch";
import jsonp from "jsonp-es6";
import { stringSimilarity } from "string-similarity-js";
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/hooks/useClient";

export interface IdentifiedTrack {
  trackId?: string | number | null;
  artistName: string;
  trackName: string;
  trackTimeMillis: number;
  trackViewUrl?: string | null;
  artworkUrl100?: string | null;
  src?: "Itunes" | "Musicdex";
  index?: string; // a unique key for this track. Should always be present.
}

export interface IdentifiedItunesTrack extends IdentifiedTrack {
  trackCensoredName?: string;
  collectionName?: string;
  releaseDate?: string;
}

export function useSongAutocomplete(query: string, config?: CommonQueryConfig) {
  const client = useClient();
  return useQuery({
    queryKey: ["song-auto", query],
    queryFn: () => getAutocomplete(client, query),
    ...config,
  });
}

async function getAutocomplete(
  client: FetchClient,
  query: string,
): Promise<(IdentifiedItunesTrack | IdentifiedTrack)[]> {
  const [musicdexResults, jpResults, enResults] = await Promise.all([
    searchMusicdex(client, query),
    searchItunes(query, "ja_jp"),
    searchItunes(query, "en_us"),
  ]);
  const lookupEn = enResults.results || [];
  // console.log(lookupEn);
  const fnLookupFn = (
    id: string | number | null | undefined,
    name: string,
    altName: string | undefined,
  ) => {
    const foundEn = lookupEn.find((x) => id && x.trackId == id);
    const possibleNames = [
      foundEn?.trackCensoredName?.toUpperCase(),
      foundEn?.trackName.toUpperCase(),
    ];
    if (
      foundEn &&
      !possibleNames.includes(name.toUpperCase()) &&
      stringSimilarity(foundEn.trackName, name) < 0.75
    ) {
      return `${name} / ${foundEn.trackCensoredName || foundEn.trackName}`;
    }
    return altName || name;
  };
  if (jpResults && jpResults.results) {
    console.log(jpResults.results);
    return [
      ...musicdexResults.slice(0, 3),
      ...jpResults.results.map(
        ({ trackId, trackName, trackCensoredName, ...rest }) => ({
          trackId,
          trackName: fnLookupFn(trackId, trackName, trackCensoredName),
          src: "iTunes",
          index: `iTunes${trackId}`,
          ...rest,
        }),
      ),
    ] as [IdentifiedItunesTrack | IdentifiedTrack];
  }

  return musicdexResults; //size 12
}

async function searchItunes(
  query: string,
  lang: string = "ja_jp",
): Promise<{ results: IdentifiedItunesTrack[] }> {
  return jsonp("https://itunes.apple.com/search", {
    term: query,
    entity: "musicTrack",
    country: "JP",
    limit: 10,
    lang,
  });
}

async function searchMusicdex(client: FetchClient, query: string) {
  try {
    const resp = await client.post<MusicdexESSearchResponse, unknown>(
      "/api/v2/musicdex/elasticsearch/search",
      "",
      {
        headers: {
          "Content-Type": "application/x-ndjson",
          Accept: "application/json, text/plain, */*",
        },
        body: `{"preference":"results"}\n${JSON.stringify({
          query: {
            bool: {
              must: [
                {
                  bool: {
                    must: [
                      {
                        multi_match: {
                          query,
                          fields: [
                            "general^3",
                            "general.romaji^0.5",
                            "original_artist^2",
                            "original_artist.romaji^0.5",
                          ],
                          type: "most_fields",
                        },
                      },
                      {
                        multi_match: {
                          query,
                          fields: ["name.ngram", "name"],
                          type: "most_fields",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          size: 12,
          _source: { includes: ["*"], excludes: [] },
          from: 0,
          sort: [{ _score: { order: "desc" } }],
        })}\n`,
      },
    );
    return (
      resp?.responses?.[0]?.hits?.hits?.map(
        ({ _source }) =>
          ({
            trackId: _source.itunesid,
            artistName: _source.original_artist,
            trackName: _source.name,
            trackTimeMillis: (_source.end - _source.start) * 1000,
            trackViewUrl: _source.amUrl,
            artworkUrl100: _source.art,
            src: "Musicdex",
            index: `Musicdex${_source.itunesid || _source.name + _source.original_artist}`,
          }) as IdentifiedTrack,
      ) || []
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

interface MusicdexESSearchResponse {
  took: number;
  responses: ResponseArrayItem[];
}

interface ResponseArrayItem {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
  status: number;
}

interface Shards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

interface Hits {
  total: {
    value: number;
    relation: string;
  };
  max_score: number;
  hits: HitItem[];
}

interface HitItem {
  _index: string;
  _id: string;
  _score: number;
  _source: SongObject;
}

interface SongObject {
  channel_id: string;
  video_id: string;
  name: string;
  start: number;
  end: number;
  itunesid: number | null;
  art: string | null;
  amUrl: string | null;
  available_at: string;
  status: string;
  is_mv: boolean;
  original_artist: string;
  creator_id: number;
  id: string;
  org: string;
  suborg: string;
  channel: {
    name: string;
    english_name: string;
  };
}
