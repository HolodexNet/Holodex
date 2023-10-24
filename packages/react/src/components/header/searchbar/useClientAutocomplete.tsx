import { useMemo } from "react";
import { JSON_SCHEMA, QueryItem, VideoQueryModel } from "./types";
import { useOrgs } from "@/services/orgs.service";
import { FIRST_SEARCH } from "./helper";
import type { TFunction } from "i18next";
import { CLIPPER_LANGS } from "@/lib/consts";

export function useClientAutocomplete(
  searchCategory: keyof VideoQueryModel | undefined,
  searchString: string,
  t: TFunction<"translation", undefined>,
) {
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
    if (searchCategory === "org" || searchCategory === undefined) {
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
      console.log(ac_opts.org);
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
        ac_opts.has_song = [
          {
            type: "has_song",
            value: "none",
            text: "$t",
          },
          {
            type: "has_song",
            value: "non-zero",
            text: "$t",
          },
          {
            type: "has_song",
            value: "one",
            text: "$t",
          },
          {
            type: "has_song",
            value: "many",
            text: "$t",
          },
        ];
        break;
      case "lang":
        ac_opts.lang = CLIPPER_LANGS.map((x) => ({ ...x, type: "lang" }));
        break;
      case "type":
        ac_opts.type = [
          { type: "type", value: "clip", text: "$t" },
          { type: "type", value: "stream", text: "$t" },
          { type: "type", value: "placeholder", text: "$t" },
        ];
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

    console.log(ac_opts);
    return ac_opts;
  }, [orgs, searchCategory, searchString, t]);
}
