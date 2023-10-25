## search bar design doc:

Basically it's a multi-select with validation and autocomplete given typed information.

```js
watch(search, (newValue) => {
      // reflect value back to input
      for (const _key of ["has_song", "type", "lang", "other"] as const)
        ac_opts[_key] = [];
      // clear ^
      const [search_class, search_term] = splitSearchClassTerms(
        newValue,
        langCategoryReversemapClass.value
      );
      console.log(search_class, search_term);

      if (search_class === "org" || search_class === undefined) {
        const lower_search_term = search_term.toLowerCase();
        ac_opts.org =
          orgs.data.value
            ?.filter(
              (x) =>
                x.name.toLowerCase().includes(lower_search_term) ||
                x.name_jp?.toLowerCase().includes(lower_search_term)
            )
            ?.slice(0, search_class === "org" ? 20 : 5) // only give 5 suggestions when searching broadly.
            ?.map((x) => ({
              type: "org",
              value: x.name,
              text: langPrefs.preferredLocaleFn(x.name, x.name_jp) || x.name,
            })) || [];
      } else {
        ac_opts.org = []; // clear
      }

      if (search_class === undefined) {
        const categoryAutofill = FIRST_SEARCH.filter((x) =>
          t(`search.class.${x.type}`, x.type).startsWith(search_term)
        );

        const ok = JSON_SCHEMA.search.suggestionOK?.(query.value);
        ac_opts.other = ok
          ? [
              {
                type: "search",
                value: search_term,
                text: "?",
                replace: ok === "replace",
              },
              ...categoryAutofill,
            ]
          : categoryAutofill;
        return;
      }

      // everything else only gets autocompleted when needed:
      switch (search_class) {
        case "has_song":
          const ok = JSON_SCHEMA.has_song.suggestionOK?.(query.value);
          if (ok) {
            ac_opts.has_song = [
              {
                type: "has_song",
                value: "none",
                text: "$t",
                replace: ok === "replace",
              },
              {
                type: "has_song",
                value: "non-zero",
                text: "$t",
                replace: ok === "replace",
              },
              {
                type: "has_song",
                value: "one",
                text: "$t",
                replace: ok === "replace",
              },
              {
                type: "has_song",
                value: "many",
                text: "$t",
                replace: ok === "replace",
              },
            ];
          }
          return;
        case "lang":
          ac_opts.lang = CLIPPER_LANGS.map((x) => ({ ...x, type: "lang" }));
          return;
        case "type":
          ac_opts.type = [
            { type: "type", value: "clip", text: "$t" },
            { type: "type", value: "stream", text: "$t" },
            { type: "type", value: "placeholder", text: "$t" },
          ];
          return;
        case "org":
        case "topic":
        case "vtuber":
          return;
        default:
          const ok2 = JSON_SCHEMA[search_class].suggestionOK?.(query.value);
          if (ok2 ?? true) {
            ac_opts.other = [
              {
                type: search_class,
                value: search_term,
                text: "?",
                replace: ok2 === "replace",
              },
            ];
          }
      }
    })

```
