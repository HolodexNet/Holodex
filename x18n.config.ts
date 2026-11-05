import { braces, doubleBraces } from "@x18n/builtins/placeholders"
import { createLibraryPlugin, defineConfig } from "@x18n/core"

import holodexYaml from "./scripts/x18n-yaml.ts"

export default defineConfig({
  sourceLocale: "en",
  presets: ["general"],
  // These files are delivery bundles sharing ordinary dotted keys. Neither
  // filename is a namespace, so do not use a {namespace} path token here.
  resources: [
    { pattern: "src/locales/{locale}/ui.yml" },
    { pattern: "src/locales/{locale}/seo.yml" },
  ],
  formats: { yml: "holodex-yaml", yaml: "holodex-yaml" },
  keyStyle: "nested",
  usage: {
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/lib/i18n.ts", "src/components/icons/**"],
    calls: [
      { callee: "t", params: { arg: 1 } },
      // tc() injects n/count, which x18n's param-mismatch check cannot model.
      { callee: "tc" },
      { callee: "tl" },
      {
        callee: ["useT", "getT"],
        factory: true,
        // Bare names cover destructuring (including aliases); dotted names
        // cover translator.t()/tc()/tl() on the returned object.
        returns: ["t", "tc", "tl", ".t", ".tc", ".tl"],
      },
    ],
    // The JS scanner cannot follow a member on a call result in x18n 0.1.x.
    regex: [
      {
        extensions: ["ts", "tsx"],
        patterns: [
          "\\b(?:getT|useT)\\s*\\(\\s*\\)\\s*\\.\\s*(?:t|tc|tl)\\s*\\(\\s*['\"`]({key})['\"`]",
        ],
      },
    ],
    // tl() reads an entire list; the adapter exposes its items by index.
    derivedKeys: ["{key}.*"],
    // These labels come from action/sort tables rather than literal calls.
    keysInUse: [
      "views.search.sort.*",
      "selection.copyLinks",
      "curation.addMentions",
      "curation.smart.*",
      "videoEdit.approach.*",
      "videoEdit.keys.*",
      "videoEdit.songs.issues.*",
      "videoEdit.songs.save.stopped.*",
      "videoEdit.songs.saveResults.*",
      "videoEdit.songs.states.*",
    ],
  },
  plugins: [
    holodexYaml,
    createLibraryPlugin({
      name: "holodex-i18n",
      placeholders: [
        // tc() supplies these automatically, just as the previous runtime did.
        { ...braces, implicit: ["n", "count"] },
        doubleBraces,
      ],
    }),
  ],
  // TS modules use the imperative accessor. TSX keeps the general preset's
  // t() templates, backed by useT() in the enclosing component.
  extract: {
    templates: [
      {
        template: "getT().t('{key}'{args})",
        kinds: ["js-string", "js-template"],
        files: ["src/**/*.ts"],
        imports: ['import { getT } from "@/lib/i18n"'],
      },
    ],
  },
})
