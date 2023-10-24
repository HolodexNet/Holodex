import dayjs from "dayjs";
import type {
  QueryItem,
  SearchableCategory,
  //   VideoQueryContainer,
  VideoQueryModel,
} from "./types";
import { JSON_SCHEMA } from "./types";

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

/**
 * Split a string with a RegExp separator an optionally limited number of times.
 * @param {string} input
 * @param {RegExp} separator
 * @param {number} [limit] - If not included, splits the maximum times
 * @returns {string[]}
 */
function split(input: Readonly<string>, separator: RegExp, limit: number = -1) {
  // Ensure the separator is global
  const _separator = new RegExp(separator, "g");
  // Allow the limit argument to be excluded

  const output = [];
  let finalIndex = 0;

  while (limit--) {
    const lastIndex = _separator.lastIndex;
    const search = _separator.exec(input);
    if (search === null) {
      break;
    }
    finalIndex = _separator.lastIndex;
    output.push(input.slice(lastIndex, search.index));
  }

  output.push(input.slice(finalIndex));

  return output;
}

export function splitSearchClassTerms(
  term: string,
  langCategoryReversemapClass: Record<string, keyof typeof JSON_SCHEMA>,
): [SearchableCategory | undefined, string] {
  const [q_class, q_value = ""] = split(term, /[:：]/, 1);
  const trimmed_class = q_class.trim();
  const system_class =
    langCategoryReversemapClass[trimmed_class] || trimmed_class;
  if (JSON_SCHEMA[<SearchableCategory>system_class]) {
    // q_class is a valid class, ergo:
    return [
      <SearchableCategory>langCategoryReversemapClass[trimmed_class],
      q_value.trim(),
    ];
  } else {
    return [undefined, term.trim()];
  }
}

export function getQueryModelFromQuery(
  query: QueryItem[],
): VideoQueryModel | null {
  if (!query) return null;
  const vqm: VideoQueryModel = {};

  query.forEach((tag) => {
    const cat = tag.type,
      content = tag.value;

    if (JSON_SCHEMA[cat]) {
      switch (cat) {
        case "org":
        case "type":
        case "topic":
        case "vtuber":
        case "lang":
          vqm[cat] =
            vqm[cat] && typeof vqm[cat] === "object"
              ? [...(vqm[cat] as string[]), content]
              : [content];
          break;
        case "search":
        case "description":
          vqm[cat] = content;
          break;
        case "from":
        case "to":
          vqm[cat] = dayjs(content).toISOString();
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

/**
 * Sanitizes the given dirty query model and returns a sanitized VideoQueryModel.
 *
 * @param {Partial<Record<keyof VideoQueryModel, unknown>>} dirtyQueryModel - The dirty query model to be sanitized.
 * @return {VideoQueryModel} The sanitized VideoQueryModel.
 */
export function sanitizeQueryModel(
  dirtyQueryModel: Partial<Record<keyof VideoQueryModel, unknown>>,
): VideoQueryModel {
  const sanitizedQueryModel: VideoQueryModel = {} as VideoQueryModel;

  for (const key of Object.keys(dirtyQueryModel) as (keyof VideoQueryModel)[]) {
    const isStringArrayExpected = JSON_SCHEMA[key].type === "array";
    const isDirtyValueString = typeof dirtyQueryModel[key] === "string";

    if (
      isStringArrayExpected &&
      isDirtyValueString &&
      (key == "org" ||
        key == "type" ||
        key == "topic" ||
        key == "vtuber" ||
        key == "lang")
    ) {
      sanitizedQueryModel[key] = [dirtyQueryModel[key]] as string[]; // force upcast string to array
    } else {
      sanitizedQueryModel[key] = dirtyQueryModel[key] as
        | (string[] & ("one" | "none" | "many" | "non-zero"))
        | undefined;
    }
  }

  return sanitizedQueryModel;
}

function channelStub(id: string) {
  return fetch(`/statics/channel/${id}.json`).then<ShortChannel>((r) =>
    r.json(),
  );
}

/**
 * This is a TypeScript function that takes a VideoQueryModel object and returns a promise that resolves to an array of QueryItem objects.

 * This is to facilitate display of a input VideoQueryModel object (which usually lacks metadata to become nicely renderable chips)
 * @param queryModel
 */
export async function getQueryFromQueryModel(
  queryModel: VideoQueryModel,
): Promise<QueryItem[]> {
  console.log(queryModel);
  /**
   * The function uses a generator function to loop over the keys of the queryModel object and yield promises for each QueryItem that should be included in the final array.
   */
  async function* generator() {
    for (const key of Object.keys(queryModel) as (keyof VideoQueryModel)[]) {
      if ((key as string) === "page") continue;
      // if its a vtuber (needs special handling)
      if (key === "vtuber") {
        if (typeof queryModel[key] === "string" && queryModel[key])
          queryModel[key] = [queryModel[key] as unknown as string]; //force upcast string to array.
        for (const v of queryModel[key] as string[]) {
          yield new Promise<QueryItem>((resolve, _) => {
            channelStub(v)
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
          value: queryModel[key]!, // i promise it's not undefined.
          text: dayjs(queryModel[key]).format("YYYY-MM-DD HH:mm:ss Z"),
        });
      } else if (JSON_SCHEMA[key]) {
        // key is a single value'd string instance
        yield Promise.resolve<QueryItem>({
          type: key,
          value: queryModel[key] as string,
          text: queryModel[key] as string,
        });
      }
    }
  }

  return await gen2array(generator());
}

// type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// export function useSearch(
//   queryModel: MaybeRef<VideoQueryModel>,
//   queryContainer: MaybeRef<WithOptional<VideoQueryContainer, "query">>,
//   // options: Ref<Partial<UseQueryOptions>>
// ) {
//   const query = computed(() => {
//     const qC = get(queryContainer);
//     qC.query = sanitizeQueryModel(get(queryModel));

//     return qC;
//   });

//   return useQuery(
//     ["search", query] as const,
//     async (key) => {
//       return (await backendApi.searchV3(key.queryKey[1] as any)).data;
//     },
//     {
//       enabled: true,
//       staleTime: 10 * 60 * 1000, // 10min.
//       cacheTime: 12 * 60 * 1000, // 12min.
//     },
//   );
// }
