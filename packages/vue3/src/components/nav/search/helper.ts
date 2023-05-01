import backendApi from "@/utils/backend-api";
import { dayjs } from "@/utils/time";
import type {
  SearchableCategory,
  VideoQueryContainer,
  VideoQueryModel,
} from "./types";
import { JSON_SCHEMA } from "./types";
import { MaybeRef, get } from "@vueuse/shared";
import { UseQueryOptions, useQuery } from "@tanstack/vue-query";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean;
  _raw?: any;
};

export const FIRST_SEARCH: QueryItem[] = [
  { type: "search", incomplete: true, value: "", text: "?" },
  { type: "org", incomplete: true, value: "", text: "?" },
  { type: "vtuber", incomplete: true, value: "", text: "?" },
  { type: "topic", incomplete: true, value: "", text: "?" },
  { type: "type", incomplete: true, value: "", text: "?" },
  {
    type: "from",
    incomplete: true,
    value: "",
    text: "?",
  },
  {
    type: "to",
    incomplete: true,
    value: "",
    text: "?",
  },
  { type: "lang", incomplete: true, value: "", text: "?" },
  { type: "has_song", incomplete: true, value: "", text: "?" },
  { type: "description", incomplete: true, value: "", text: "?" },
  // { type: "advanced", incomplete: true, value: "", text: "?" },
];

export const AUTOCOMPLETE_OPTIONS = {
  type: {
    choices: [],
  },
};

export function splitSearchClassTerms(
  term: string,
  langCategoryReversemapClass: Record<string, keyof typeof JSON_SCHEMA>
): [SearchableCategory | undefined, string] {
  const [q_class, ...q_value] = term.split(":");
  const trimmed_class = q_class.trim();
  const system_class =
    langCategoryReversemapClass[trimmed_class] || trimmed_class;
  if (JSON_SCHEMA[<SearchableCategory>system_class]) {
    // q_class is a valid class, ergo:
    return [
      <SearchableCategory>langCategoryReversemapClass[trimmed_class],
      q_value.join(":").trim(),
    ];
  } else {
    return [undefined, term.trim()];
  }
}

export function getQueryModelFromQuery(
  query: QueryItem[]
): VideoQueryModel | null {
  if (!query) return null;
  const vqm: VideoQueryModel = {};

  query.forEach((tag) => {
    const cat = tag.type,
      content = tag.value;

    if (JSON_SCHEMA[cat]) {
      switch (JSON_SCHEMA[cat].type) {
        case "array":
          (vqm as any)[cat] = vqm[cat]
            ? [...(vqm[cat] as string[]), content]
            : [content];
          break;
        case "string":
          (vqm as any)[cat] = content;
          break;
        case "date":
          (vqm as any)[cat] = dayjs(content).toISOString();
          break;
      }
    } else return; //ignore.
  });
  return vqm;
}

async function gen2array<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of gen) {
    out.push(x);
  }
  return out;
}

/** sometimes the query model has strings where an array is expected. */
export function sanitizeQueryModel(
  dirtyQueryModel: Partial<Record<keyof VideoQueryModel, any>>
): VideoQueryModel {
  const out = {} as any;
  for (const key of Object.keys(dirtyQueryModel) as (keyof VideoQueryModel)[]) {
    if (
      JSON_SCHEMA[key].type === "array" &&
      typeof dirtyQueryModel[key] === "string"
    )
      out[key] = [dirtyQueryModel[key]] as any; //force upcast string to array.
    else out[key] = dirtyQueryModel[key];
  }
  return out as VideoQueryModel;
}
/**
 * This is a TypeScript function that takes a VideoQueryModel object and returns a promise that resolves to an array of QueryItem objects.

 * This is to facilitate display of a input VideoQueryModel object (which usually lacks metadata to become nicely renderable chips)
 * @param queryModel
 */
export async function getQueryFromQueryModel(
  queryModel: VideoQueryModel
): Promise<QueryItem[]> {
  console.log(queryModel);
  /**
   * The function uses a generator function to loop over the keys of the queryModel object and yield promises for each QueryItem that should be included in the final array.
   */
  async function* generator() {
    for (const key of Object.keys(queryModel) as (keyof VideoQueryModel)[]) {
      // if its a vtuber (needs special handling)
      if (key === "vtuber") {
        if (typeof queryModel[key] === "string")
          queryModel[key] = [queryModel[key]] as any; //force upcast string to array.
        for (const v of queryModel[key] as string[]) {
          yield new Promise<QueryItem>((resolve, reject) => {
            backendApi
              .channelStub(v)
              .then((ch) => {
                resolve({
                  type: "vtuber",
                  value: ch.id,
                  text: ch.name,
                  _raw: ch,
                });
              })
              .catch(() => {
                resolve({
                  type: "vtuber",
                  value: v,
                  text: v,
                });
              });
          });
        }
      } else if (
        JSON_SCHEMA[key].type === "array" &&
        typeof queryModel[key] === "object"
      ) {
        for (const v of queryModel[key] as string[]) {
          yield Promise.resolve<QueryItem>({
            type: key,
            value: v,
            text: v,
          });
        }
      } else if (key === "to" || key === "from") {
        yield Promise.resolve<QueryItem>({
          type: key,
          value: queryModel[key] as any,
          text: dayjs(queryModel[key]).format("YYYY-MM-DD HH:mm:ss Z"),
        });
      } else if (JSON_SCHEMA[key]) {
        // key is a single value'd string instance
        yield Promise.resolve<QueryItem>({
          type: key,
          value: queryModel[key] as any,
          text: queryModel[key] as any,
        });
      }
    }
  }

  return await gen2array(generator());
}

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export function useSearch(
  queryModel: MaybeRef<VideoQueryModel>,
  queryContainer: MaybeRef<WithOptional<VideoQueryContainer, "query">>
  // options: Ref<Partial<UseQueryOptions>>
) {
  const query = computed(() => {
    const qC = get(queryContainer);
    qC.query = sanitizeQueryModel(get(queryModel));

    return qC;
  });

  return useQuery(
    ["search", query] as const,
    async (key) => {
      return (await backendApi.searchV3(key.queryKey[1] as any)).data;
    },
    {
      enabled: true,
      staleTime: 10 * 60 * 1000, // 10min.
      cacheTime: 12 * 60 * 1000, // 12min.
    }
  );
}
