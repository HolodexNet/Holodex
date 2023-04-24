<template>
  <Autocomplete
    ref="autocomplete"
    v-model:search="search"
    :selection="query"
    :options="results"
    class="search-bar group mx-auto"
    :placeholder="$t('component.search.searchLabel')"
    @pop-chip="query.pop()"
    @pointed="({ n }) => scrollIntoView(n)"
    @select="
      ({ item }) => {
        eventTriggerSelectItem(item);
      }
    "
    @focus="if (!orgsEnabled) orgsEnabled = true;"
    @submit="commitSearch()"
  >
    <template #chips="{ selection }">
      <div
        v-for="(item, midx) in selection"
        :key="'chip' + item.type + item.value + midx"
        class="badge badge-ghost mr-1 cursor-default rounded-sm border-0 bg-bgColor px-1 text-xs font-semibold tracking-tight hover:badge-error"
        @click="query.splice(midx, 1)"
      >
        <span class="">{{ categoryName(item) }}:</span>
        <span class="ml-1 rounded-lg">{{ categoryValue(item) }}</span>
      </div>
    </template>
    <template #caret>
      <div
        v-if="query.length == 0 || search.length > 0"
        class="i-ion:search opacity-40"
        style="margin: auto 5px"
        @click="tryFocusInput"
      />
      <template v-else>
        <div
          class="i-icon-park-outline:enter-key hidden w-7 opacity-50 group-focus-within:block"
          style="margin: auto 5px"
          @click="commitSearch"
        />
        <div
          class="i-lucide:text-cursor-input block w-7 opacity-25 hover:text-accent-400 hover:opacity-100 group-focus-within:hidden"
          style="margin: auto 5px"
          @click="tryFocusInput"
        />
      </template>
    </template>
    <template #dropdown="{ active }">
      <!-- MENU MAIN HEADER [Search Options.... Learn More <help>]-->
      <template v-if="results[0]?.incomplete">
        <div class="flex bg-bgColor py-2 pl-8 pr-4 text-xs font-extrabold">
          <span class="cursor-default">
            {{ $t("search.menu_header_text") }}
          </span>
          <a class="ml-auto inline-flex opacity-50" href="#" :tabindex="40">
            <span>{{ $t("search.guide_btn") }}</span>
            <div class="i-ion:help-circle-outline ml-1 text-[16px]" />
          </a>
        </div>
      </template>

      <div v-for="(item, idx) in results" :key="item.text + item.value + idx">
        <template v-if="item.incomplete">
          <!-- Incomplete Search Options -->
          <div
            class="searchbar-option"
            :class="{
              'bg-bgColor-200': idx === active,
            }"
            @click="eventTriggerSelectItem(item)"
          >
            <span
              class="inline-block h-5 opacity-50"
              :class="
                icons.search[item.type] || 'i-fluent:grid-dots-20-regular'
              "
            />
            <span class="ml-2 font-light">{{ categoryName(item) }}:</span>
            <span class="ml-1 opacity-40">
              {{ categoryExplanation(item) }}
              {{ item.text !== "?" ? item.text : "" }}
            </span>
          </div>
        </template>
        <!-- Autocomplete Provided Items -->
        <template v-else>
          <!-- Category Heading: -->
          <div
            v-if="results[idx].type !== results[idx - 1]?.type"
            class="flex cursor-default border-t-2 border-bgColor-50 pb-1 pl-8 pt-2 text-xs font-extrabold uppercase"
          >
            {{ categoryName(item) }}:
            <span class="ml-1 normal-case opacity-40">
              {{ categoryExplanation(item) }}
            </span>
          </div>
          <!-- Actual Item -->
          <div
            class="searchbar-option"
            :class="{
              'bg-bgColor-200': idx === active,
            }"
            @click="eventTriggerSelectItem(item)"
          >
            <span
              v-if="item.replace"
              class="i-ic:baseline-change-circle inline-block h-5 text-base text-warning"
            >
              <!-- replace warning icon -->
            </span>
            <span
              class="inline-block h-5 opacity-50"
              :class="
                icons.search[item.type] || 'i-fluent:grid-dots-20-regular'
              "
            >
              <!-- search icon  -->
            </span>
            <span class="font-light">{{ categoryName(item) }}:</span>
            <span class="" :class="{ 'text-red-300': !validateItem(item) }">
              {{ categoryValue(item) }}
            </span>
            <div
              v-if="idx === active"
              class="i-icon-park-solid:enter-key-one ml-auto mt-1 opacity-25"
            />
          </div>
        </template>
      </div>
      <h-progress-indeterminate
        v-show="autocompleteLoading"
        style="height: 2px"
      />
    </template>
  </Autocomplete>
</template>

<script lang="ts">
import api from "@/utils/backend-api";
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
import { useDisplay } from "@/hooks/common/useDisplay";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean; // if true, clicking it will replace the prior.
  _raw?: any;
};

export default defineComponent({
  name: "SearchBar",
  components: {},
  props: {
    dense: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: Number,
      default: 500,
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

    const autocompleteLoading = ref(false);
    const autocomplete = ref();
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
          autocompleteLoading.value = true;

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

          autocompleteLoading.value = false;
        } else {
          ac_opts.vtuber = []; // clear
          ac_opts.topic = []; // clear
        }
        // alternate provision:
      },
      { debounce: 200, immediate: false }
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

    const route = useRoute();

    watch(
      () => route.query,
      async () => {
        if (route.query) {
          query.value = await getQueryFromQueryModel(
            route.query as unknown as VideoQueryModel
          );
          console.log(JSON.stringify(route.query));
        }
      },
      { immediate: true }
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
      autocomplete,
      autocompleteLoading,
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
      return this.search
        ? this.dropdown.filter(
            (dd) =>
              !this.query.find(
                (qq) => qq.type == dd.type && qq.value == dd.value
              )
          )
        : FIRST_SEARCH;
    },
  },
  watch: {
    query() {
      if (this.menuOpen) this.menuOpen = false;
    },
  },
  methods: {
    logProps(props: any) {
      console.log(props);
    },
    logWithContext(context: string) {
      return (props: any) => {
        console.log(context, JSON.stringify(props), props);
      };
    },
    async commitSearch() {
      if (!this.query || this.query.length === 0) return;

      if (this.query.length === 1 && this.query[0].type === "vtuber") {
        this.$router.push(`/channel/${this.query[0].value}`);
        return;
      }

      this.logWithContext("commitSearch")("ok");

      this.$router.push({
        path: "/search",
        query: {
          ...(getQueryModelFromQuery(this.query) as any),
          page: undefined,
        },
      });
    },
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
      // this.logWithContext("validateItem")({ item, v });
      return v ?? true;
    },
    eventTriggerSelectItem(item: QueryItem) {
      console.log("selected item");
      if (item.incomplete) {
        this.logWithContext("incomplete-item")(item);
        this.search = this.categoryName(item) + ":";
        this.tryFocusInput();
        return;
      }
      if (this.validateItem(item)) {
        this.logWithContext("trigger-event")(item);
        // console.log('huh');
        if (item.replace)
          this.query.splice(
            this.query.findIndex(({ type }) => type === item.type),
            1
          );

        this.query.push(item);
        this.search = "";
      } // onClick?.(e);
      this.logWithContext("reset-search-trigger")(item);

      this.tryFocusInput();
    },
    tryFocusInput() {
      if ((this.autocomplete as any)?.$el)
        setTimeout(() => {
          this.logWithContext("focus-input")((this.autocomplete as any).$el);
          ((this.autocomplete as any).$el as unknown as HTMLElement)
            ?.getElementsByTagName("input")[0]
            .focus();
          ((this.autocomplete as any).$el as unknown as HTMLElement)
            ?.getElementsByTagName("input")[0]
            .scrollIntoView({
              block: "end",
              inline: "end",
              behavior: "smooth",
            });
        }, 100);
    },
    scrollIntoView(n: number) {
      if (n < 0) n = 0;
      const el = ((this.autocomplete as any).$el as unknown as HTMLElement)
        ?.getElementsByClassName("option")
        .item(n);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },
  },
});
</script>
<style>
.search-bar {
  max-width: min(v-bind('maxWidth+"px"'), 100%) !important;
}
</style>
<style lang="scss">
.search-bar {
  // width management.
  padding: 2px 6px;
  @apply rounded-md bg-bgColor-600;
}
.searchbar-option {
  @apply flex cursor-pointer gap-1 px-2 py-1 text-sm hover:bg-bgColor-300;
}
</style>
