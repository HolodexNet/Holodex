import { useMemo } from "react";
import { QueryItem, VideoQueryModel } from "../types";
import { useOrgs } from "@/services/orgs.service";
import { FIRST_SEARCH } from "../helper";
import type { TFunction } from "i18next";
import { CLIPPER_LANGS } from "@/lib/consts";

/**
 * Provides client-side autocomplete suggestions based on the search category and search string.
 *
 * @param {keyof VideoQueryModel | undefined} searchCategory - The category to search in, which can be one of the keys in VideoQueryModel or undefined for a broader search.
 * @param {string} searchString - The search string to use for filtering autocomplete suggestions.
 * @param {TFunction<"translation", undefined>} t - Translation function for localizing suggestion text.
 * @returns {Record<"org" | "from" | "to" | "search" | "description" | "type" | "lang" | "has_song" | "other", QueryItem[]>} - An object containing categorized autocomplete suggestions.
 */
export function useClientAutocomplete(
  searchCategory: keyof VideoQueryModel | undefined,
  searchString: string,
  t: TFunction<"translation", undefined>,
): Record<
  | "org"
  | "from"
  | "to"
  | "search"
  | "description"
  | "type"
  | "lang"
  | "has_song"
  | "other",
  QueryItem[]
> {
  const { data: orgs } = useOrgs({ enabled: !!searchString });
  return useMemo(() => {
    const ac_opts: Record<
      Exclude<keyof VideoQueryModel | "other", "vtuber" | "topic">,
      QueryItem[]
    > = {
      org: [],
      type: [],
      search: [],
      lang: [],
      to: [],
      description: [],
      from: [],
      has_song: [],
      other: [],
    };
    if (
      searchCategory === "org" ||
      (searchCategory === undefined && searchString)
    ) {
      const _squery = searchString.toLowerCase();
      ac_opts.org =
        orgs
          ?.filter(
            (x) =>
              !searchString ||
              x.name.toLowerCase().includes(_squery) ||
              x.name_jp?.toLowerCase().includes(_squery),
          )
          ?.slice(0, searchCategory === "org" ? 20 : 5) // only give 5 suggestions when searching broadly.
          ?.map((x) => ({
            type: "org",
            value: x.name,
            text: /*langPrefs.preferredLocaleFn(x.name, x.name_jp) ||*/ x.name,
          })) || [];
    }

    if (searchCategory === undefined) {
      const categoryAutofill = FIRST_SEARCH.filter(
        (x) =>
          !searchString ||
          t(`search.class.${x.type}`, x.type).startsWith(searchString),
      );
      ac_opts.other = categoryAutofill;

      if (!categoryAutofill.find((x) => x.type == "search")) {
        ac_opts.search = [
          {
            type: "search",
            value: searchString,
            text: searchString,
          },
        ];
      }

      return ac_opts;
    }

    // everything else only gets autocompleted when needed:
    switch (searchCategory) {
      case "has_song":
        ac_opts.has_song = ["none", "non-zero", "one", "many"].map((value) => ({
          type: "has_song",
          value,
          text: "$t",
        }));
        break;

      case "lang":
        ac_opts.lang = CLIPPER_LANGS.map((x) => ({ ...x, type: "lang" }));
        break;

      case "type":
        ac_opts.type = ["clip", "stream", "placeholder"].map((value) => ({
          type: "type",
          value,
          text: "$t",
        }));
        break;

      case "org":
      case "topic":
      case "vtuber":
        break;

      default:
        ac_opts.other = [
          {
            type: searchCategory,
            value: searchString,
            text: searchString,
          },
        ];
    }

    return ac_opts;
  }, [orgs, searchCategory, searchString, t]);
}
