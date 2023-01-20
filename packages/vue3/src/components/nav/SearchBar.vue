<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <!-- <span> {{ $t("component.search.searchLabel") }}</span> -->
  <v-autocomplete
    ref="autocomplete"
    v-model:model-value="query"
    v-model:search="search"
    v-model:menu="menuOpen"
    class="mx-auto search-bar"
    :class="{ 'search-bar-small': isMobile }"
    multiple
    chips
    hide-no-data
    hide-selected
    :rules="[validate]"
    :loading="isLoading"
    :items="results"
    :custom-filter="customFilter"
    :placeholder="$t('component.search.searchLabel')"
    item-value="value"
    no-filter
    density="compact"
    variant="plain"
    label="Search"
    return-object
    hide-details
    menu-icon=""
    :menu-props="({ location: 'bottom' } as any)"
    type="search"
    @keydown.backspace="
      (e) => {
        if (!search) query.pop(); // backspace to remove last filter
      }
    "
    @keydown.enter="onEnterKeyDown"
    @focus="
      () => {
        if (!orgsEnabled) orgsEnabled = true;
      }
    "
  >
    <template #append-inner>
      <div
        v-if="query.length == 0 || search.length > 0"
        class="opacity-40 i-ion:search"
        style="margin-top: 2px"
      ></div>
      <div
        v-else
        class="opacity-25 i-icon-park-solid:enter-key-one"
        style="margin-top: 2px"
      ></div>
    </template>
    <template #append-item>
      <v-progress-linear
        indeterminate
        :class="autocomplete_loading && '-mb-2'"
        color="accent"
        :active="autocomplete_loading"
      ></v-progress-linear>
    </template>
    <template #chip="{ item, props }">
      <div
        class="px-1 mr-1 tracking-tight badge badge-ghost bg-bgColor border-0 text-xs rounded-sm font-semibold hover:badge-error cursor-default"
        v-bind="props"
        @click="props['onClick:close']"
      >
        <span class=""> {{ categoryName(item.raw) }}: </span>
        <span class="rounded-lg ml-1"> {{ categoryValue(item.raw) }} </span>
      </div>
    </template>
    <template #item="{ item, index, props }">
      <!-- MENU MAIN HEADER [Search Options.... Learn More <help>]-->
      <template v-if="index === 0 && item.raw.incomplete">
        <div class="py-2 pl-8 pr-4 text-xs flex font-extrabold">
          <span class="cursor-default">{{
            $t("search.menu_header_text")
          }}</span>
          <a
            class="group opacity-50 inline-flex ml-auto"
            href="#"
            :tabindex="40"
          >
            <span>{{ $t("search.guide_btn") }}</span>
            <div class="ml-1 text-[16px] i-ion:help-circle-outline"></div>
          </a>
        </div>
      </template>
      <!-- INCOMPLETE SEARCH ITEMS -->
      <template v-if="item.raw.incomplete">
        <div
          class="px-2 py-1 cursor-pointer text-sm flex hover:bg-bgColor-300"
          @click.stop="
            (e) => {
              search = categoryName(item.raw) + ':';
              e.stopImmediatePropagation();
            }
          "
        >
          <span
            class="inline-block opacity-50 h-5"
            :class="
              icons.search[item.raw.type] || 'i-fluent:grid-dots-20-regular'
            "
          ></span>
          <span class="ml-2 font-light"> {{ categoryName(item.raw) }}: </span>
          <span class="ml-1 opacity-40">
            {{ categoryExplanation(item.raw) }}
            {{ item.raw.text !== "?" ? item.raw.text : "" }}
          </span>
        </div>
      </template>
      <!-- Autocomplete Provided Items -->
      <template v-else>
        <!-- Category Heading: -->
        <div
          v-if="results[index].type !== results[index - 1]?.type"
          class="pb-1 pt-2 pl-8 cursor-default flex text-xs font-extrabold uppercase border-t-2 border-bgColor-50 first-of-type:-mt-2 mt-1"
        >
          {{ categoryName(item.raw) }}:
          <span class="opacity-40 normal-case ml-1">
            {{ categoryExplanation(item.raw) }}
          </span>
        </div>
        <!-- Actual Item -->
        <div
          v-bind="props"
          :tabindex="index + 2"
          class="px-2 py-1 cursor-pointer text-sm flex hover:bg-bgColor-300 focus:bg-bgColor-300"
          :class="{ 'text-red-300': !validateItem(item.raw) }"
          @keydown.enter="
            (e) => {
              if(validateItem(item.raw)) props['onClick']?.(e);
              (autocomplete as unknown as HTMLElement)?.getElementsByTagName('input')[0].focus()
            }
          "
          @click="
            (e) => {
              if (validateItem(item.raw)) props['onClick']?.(e);
            }
          "
        >
          <span
            class="inline-block opacity-50 h-5"
            :class="
              icons.search[item.raw.type] || 'i-fluent:grid-dots-20-regular'
            "
          ></span>
          <span class="ml-2 font-light"> {{ categoryName(item.raw) }}: </span>
          <span class="ml-1">
            {{ categoryValue(item.raw) }}
          </span>
          <div
            v-if="index === 0"
            class="ml-auto opacity-25 i-icon-park-solid:enter-key-one mt-1"
          ></div>
        </div>
      </template>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
// import debounce from "lodash-es/debounce";
// import { useLangStore } from "@/stores/lang";
import { useDisplay } from "vuetify";
import {
  FIRST_SEARCH,
  getQueryModelFromQuery,
  splitSearchClassTerms,
  getQueryFromQueryModel,
} from "./search/helper";
import { useOrgList } from "@/services/static";
import { useLangStore, useSiteStore } from "@/stores";
import { watchDebounced } from "@vueuse/core";
import {
  JSON_SCHEMA,
  SearchableCategory,
  VideoQueryModel,
} from "./search/types";
import { CLIPPER_LANGS } from "@/utils/consts";
import { useI18n } from "vue-i18n";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  _raw?: any;
};

export default defineComponent({
  name: "SearchBar",
  props: {
    dense: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    // const lang = useLangStore();
    const display = useDisplay();
    const currentOrgs = useSiteStore();
    const langPrefs = useLangStore();
    const { t } = useI18n();

    const orgsEnabled = ref(false); // we're just saving some extra startup time by not having this immediately fire. OnFocus, it'll fire.
    const orgs = useOrgList({
      enabled: orgsEnabled,
      initialData: currentOrgs.starredOrgs,
    });
    const search = ref("");
    const query = ref([] as Array<QueryItem>);

    const autocomplete_loading = ref(false);
    const autocomplete = ref(null);

    const ac_opts = reactive<
      Record<
        "org" | "vtuber" | "topic" | "has_song" | "lang" | "type" | "other",
        QueryItem[]
      >
    >({
      vtuber: [],
      topic: [],
      org: [],
      has_song: [],
      type: [],
      lang: [],
      other: [],
    });

    const langCategoryReversemapClass = computed<
      Record<string, keyof typeof JSON_SCHEMA>
    >(() => {
      const out: Record<string, keyof typeof JSON_SCHEMA> = {};
      Object.keys(JSON_SCHEMA).forEach((x) => {
        out[t(`search.class.${x}`)] = x as keyof typeof JSON_SCHEMA;
      });
      return out;
    });

    // instantly updating autocomplete!
    watch(search, (newValue) => {
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

        ac_opts.other = JSON_SCHEMA.search.suggestionOK?.(query.value)
          ? [
              {
                type: "search",
                value: search_term,
                text: "?",
              },
              ...categoryAutofill,
            ]
          : categoryAutofill;
        return;
      }

      // everything else only gets autocompleted when needed:
      switch (search_class) {
        case "has_song":
          if (JSON_SCHEMA.has_song.suggestionOK?.(query.value)) {
            ac_opts.has_song = [
              { type: "has_song", value: "none", text: "$t" },
              { type: "has_song", value: "non-zero", text: "$t" },
              { type: "has_song", value: "one", text: "$t" },
              { type: "has_song", value: "many", text: "$t" },
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
          if (JSON_SCHEMA[search_class].suggestionOK?.(query.value) ?? true) {
            ac_opts.other = [
              {
                type: search_class,
                value: search_term,
                text: "?",
              },
            ];
          }
      }
    });
    // handle autocomplete for SERVER SIDE QUERIES
    watchDebounced(
      search,
      async (newValue) => {
        const [search_class, search_term] = splitSearchClassTerms(
          newValue,
          langCategoryReversemapClass.value
        );
        if (
          search_term.length >= 1 &&
          (search_class === "vtuber" ||
            search_class === "topic" ||
            search_class === undefined)
        ) {
          autocomplete_loading.value = true;
          const x = await api.searchV3Autocomplete(
            search_term,
            search_class,
            search_class ? 15 : undefined
          );
          ac_opts.vtuber =
            x.data.vtuber?.map((x) => ({
              type: "vtuber",
              value: x.id,
              text:
                langPrefs.preferredLocaleFn(x.english_name, x.name) || x.name,
              _raw: x,
            })) || [];
          ac_opts.topic =
            x.data.topic?.map((x) => ({
              type: "topic",
              value: x.id,
              text: x.id,
            })) || [];
          autocomplete_loading.value = false;
        } else {
          ac_opts.vtuber = []; // clear
          ac_opts.topic = []; // clear
        }
        // alternate provision:
      },
      { debounce: 200 }
    );

    const dropdown = computed(() => {
      return (
        ["other", "org", "vtuber", "topic", "has_song", "lang", "type"] as const
      ).reduce((p, k) => {
        p.push(...ac_opts[k]);
        return p;
      }, [] as QueryItem[]);
    });

    const isMobile = display.mobile;

    const router = useRouter();
    const route = useRoute();

    watch(
      () => route.query,
      async () => {
        if (route.query.search) {
          query.value = await getQueryFromQueryModel(
            route.query as unknown as VideoQueryModel
          );
        }
      }
    );

    return {
      display,
      isMobile,
      orgs,
      orgsEnabled,
      search,
      ac_opts,
      query,
      dropdown,
      autocomplete_loading,
      autocomplete,
      langPrefs,
    };
  },
  data() {
    return {
      isLoading: false,
      menuOpen: false,
      // fromApi: [] as Array<Query>,
    };
  },
  computed: {
    results() {
      return this.search ? this.dropdown : FIRST_SEARCH;
    },
  },
  watch: {
    query() {
      if (this.menuOpen) this.menuOpen = false;
    },
    // "$route.query": {
    //   deep: true,
    //   async handler({ q }) {
    //     if (q) {
    //       this.query = await csv2jsonAsync(q);
    //     }
    //   },
    // },
    // eslint-disable-next-line func-names
    // search: {
    //   handler: function (val: string) {
    //     if (!val) return FIRST_SEARCH;
    //     this.fromApi = [];
    //     const entropy = encodeURIComponent(val.trim()).length;
    //     if (entropy <= 1) return;
    //     const formatted = val.trim().replace("#", "");
    //     this.getAutocomplete(formatted)
    //       .then((res) => {
    //         let textQueries: Query[] = [];
    //         if (encodeURIComponent(val).length > 1) {
    //           textQueries = [
    //             {
    //               type: "title",
    //               value: `${val}`,
    //               text: val.trim(),
    //             },
    //             // { type: "comments", value: `${val}comments`, text: val.trim() },
    //           ];
    //         }
    //         this.fromApi = [
    //           ...textQueries,
    //           ...res.data.map((x: Query) => {
    //             if (!x.text) x.text = x.value;
    //             return x;
    //           }),
    //         ];
    //         console.log(JSON.stringify(this.fromApi, undefined, 2));
    //       })
    //       .catch((e) => console.log(e));
    //   },
    // },
  },
  async mounted() {
    if (this.$route.query && this.$route.query.q) {
      this.query = await csv2jsonAsync(this.$route.query.q as string);
    }
  },
  methods: {
    logProps(props: any) {
      console.log(props);
    },
    // async getAutocomplete(query: string) {
    //   this.isLoading = true;
    //   const res = await api.searchAutocomplete(query);
    //   this.isLoading = false;
    //   return res;
    // },
    // deleteChip(item: Query) {
    //   this.query.splice(this.query.map((q) => q.value).indexOf(item.value), 1);
    // },
    async commitSearch() {
      if (!this.query || this.query.length === 0) return;

      if (this.query.length === 1 && this.query[0].type === "vtuber") {
        this.$router.push(`/channel/${this.query[0].value}`);
        return;
      }

      this.$router.push({
        path: "/search",
        query: {
          ...this.$route.query,
          ...(getQueryModelFromQuery(this.query) as any),
          page: undefined,
        },
      });
    },
    // addItem(item: any) {
    //   // console.log(item);
    //   this.query.push({ ...item });
    // },
    validate(currentQuery: QueryItem[]) {
      return true;
    },
    categoryName(query: QueryItem) {
      return this.$t(`search.class.${query.type}`, query.type);
    },
    categoryExplanation(query: QueryItem) {
      return this.$t(`search.class_explanation.${query.type}`, " ");
    },
    categoryValue(query: QueryItem) {
      if (query.type === "vtuber" && query._raw && query._raw.name) {
        return this.langPrefs.preferredLocaleFn(
          query._raw.english_name,
          query._raw.name
        );
      }
      return query.text === "$t"
        ? this.$t(`search.class_values.${query.type}.${query.value}`, " ")
        : query.text === "?"
        ? query.value
        : query.text;
    },
    validateItem(item: QueryItem) {
      const v = JSON_SCHEMA[item.type]?.validation?.(item);
      return v ?? true;
    },
    onEnterKeyDown() {
      if (this.search === null || this.search.length === 0) {
        this.commitSearch();
      } else {
        if (this.results?.[0]?.incomplete) {
          this.search = this.results[0].type + ":";
        } else if (this.results?.[0]) {
          this.query.push(this.results?.[0]);
          this.search = "";
        }
      }
    },
    customFilter(a: any, b: any, c: any) {
      console.log(a, b, c);
      return true;
    },
  },
});
</script>

<style lang="scss">
.search-bar {
  // width management.
  max-width: min(670px, 100vw) !important;
  padding: 2px 6px;
  @apply bg-bgColor-600 rounded-md;

  // height: 50px;
  * {
    --v-field-padding-top: 0px !important;
    --v-field-padding-bottom: 0px !important;
    --v-input-padding-top: 2px !important;
    --autocomplete-chips-margin-bottom: 0px !important;
    --v-input-control-height: 24px;
  }

  .v-autocomplete__selection {
    height: 20px;
    margin-top: 0px !important;
  }

  .v-label.v-field-label {
    display: none;
  }

  .v-field__input {
    // padding-top: 10px;
    // display: block;
    overflow-x: auto;
    overflow-wrap: unset;
    overflow-y: clip;
    // height: 40px;
    white-space: nowrap;
    font-size: 13px;
    line-height: 20px;

    scrollbar-width: thin;
    scrollbar-width: 4px;

    & > input {
      min-width: 150px !important;
    }

    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(116, 116, 116, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(182, 182, 182, 0.4);
    }
  }
}

/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
