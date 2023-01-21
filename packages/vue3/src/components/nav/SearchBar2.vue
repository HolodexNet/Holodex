<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <!-- <span> {{ $t("component.search.searchLabel") }}</span> -->
  <!--     :custom-filter="customFilter"  -->
  <!-- Vue 3 V-Select Notes:
    :value is now model-value
    input is now @update:model-Value -->
  <!-- 
            v-model:search="search"
    v-model:menu="menuOpen"
    class="mx-auto search-bar group"
    multiple
    chips
    hide-no-data
    hide-selected
    :rules="[validate]"
    :loading="isLoading"
    :items="results"
    :placeholder="$t('component.search.searchLabel')"
    return-object
    hide-details
    menu-icon=""
    :menu-props="({ location: 'bottom' } as any)"
    type="search"

     -->
  <vue-select
    ref="autocomplete"
    v-model:model-value="query"
    multiple
    class="mx-auto search-bar group"
    :filterable="false"
    :options="results"
    append-to-body
    @keydown.backspace="
      (e) => {
        if (!search_query) query.pop(); // backspace to remove last filter
      }
    "
    @keydown.enter="onEnterKeyDown"
    @focus="
      () => {
        if (!orgsEnabled) orgsEnabled = true;
      }
    "
    @search="
      (q: any, loading: any) => {
        logProps({ src: '@search-event', q, loading });
      }
    "
  >
    <template #open-indicator>
      <div
        v-if="query.length == 0 || search_query.length > 0"
        class="opacity-40 i-ion:search"
        style="margin-top: 2px"
      ></div>
      <template v-else>
        <div
          class="group-focus-within:block hidden opacity-50 i-icon-park-outline:enter-key w-7"
          style="margin: auto 0px"
        ></div>
        <div
          class="group-focus-within:hidden hover:text-accent-400 hover:opacity-100 block opacity-25 i-lucide:text-cursor-input w-7"
          style="margin: auto 0px"
        ></div
      ></template>
    </template>
    <template #append-item>
      <v-progress-linear
        indeterminate
        :class="autocomplete_loading && '-mb-2'"
        color="accent"
        :active="autocomplete_loading"
      ></v-progress-linear>
    </template>
    <template
      #selected-option-container="{ option, deselect /*, multiple, disabled*/ }"
    >
      <div
        class="px-1 mr-1 tracking-tight badge badge-ghost bg-bgColor border-0 text-xs rounded-sm font-semibold hover:badge-error cursor-default"
        @click="deselect"
      >
        <span class=""> {{ categoryName(option) }}: </span>
        <span class="rounded-lg ml-1"> {{ categoryValue(option) }} </span>
      </div>
    </template>
    <template #list-header>
      <!-- MENU MAIN HEADER [Search Options.... Learn More <help>]-->

      <template v-if="results?.[0]?.incomplete">
        <div class="py-2 pl-8 pr-4 text-xs flex font-extrabold">
          <span class="cursor-default">{{
            $t("search.menu_header_text")
          }}</span>
          <a class="opacity-50 inline-flex ml-auto" href="#" :tabindex="40">
            <span>{{ $t("search.guide_btn") }}</span>
            <div class="ml-1 text-[16px] i-ion:help-circle-outline"></div>
          </a>
        </div>
      </template>
    </template>
    <template #search="{ attributes, events }">
      <input
        v-bind="attributes"
        :value="search_query"
        class="vs__search"
        v-on="events"
        @input.stop="
          (e) => {
            search_query = e?.target?.value;
          }
        "
    /></template>
    <template #option="item">
      <!-- INCOMPLETE SEARCH ITEMS -->
      <template v-if="item.incomplete">
        <div
          class="px-2 py-1 cursor-pointer text-sm flex hover:bg-bgColor-300"
          :tabindex="item._idx + 2"
          @click.stop="
            (e) => {
              logProps({ state: ' clickedincomplete', item });
              search_query = categoryName(item) + ':';
              e.stopImmediatePropagation();
            }
          "
        >
          <span
            class="inline-block opacity-50 h-5"
            :class="icons.search[item.type] || 'i-fluent:grid-dots-20-regular'"
          ></span>
          <span class="ml-2 font-light"> {{ categoryName(item) }}: </span>
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
          v-if="item.type !== results?.[item._idx - 1]?.type"
          class="pb-1 pt-2 pl-8 cursor-default flex text-xs font-extrabold uppercase border-t-2 border-bgColor-50"
          @click.stop
        >
          {{ categoryName(item) }}:
          <span class="opacity-40 normal-case ml-1">
            {{ categoryExplanation(item) }}
          </span>
        </div>
        <!-- Actual Item -->
        <div
          :tabindex="item._idx + 2"
          class="px-2 py-1 cursor-pointer text-sm flex hover:bg-bgColor-300 focus:bg-bgColor-300"
          @keydown.enter="
            (e) => eventTriggerSelectItem(e, item, () => query.push(item))
          "
          @click.stop="
            (e) => eventTriggerSelectItem(e, item, () => query.push(item))
          "
        >
          <span
            v-if="item.replace"
            class="inline-block text-warning mr-1 text-base i-ic:baseline-change-circle h-5"
          >
            <!-- replace warning icon -->
          </span>
          <span
            class="inline-block opacity-50 h-5"
            :class="icons.search[item.type] || 'i-fluent:grid-dots-20-regular'"
          >
            <!-- search icon  -->
          </span>
          <span class="ml-2 font-light"> {{ categoryName(item) }}: </span>
          <span class="ml-1" :class="{ 'text-red-300': !validateItem(item) }">
            {{ categoryValue(item) }}
          </span>
          <div
            v-if="item._idx === 0"
            class="ml-auto opacity-25 i-icon-park-solid:enter-key-one mt-1"
          ></div>
        </div>
      </template>
    </template>
  </vue-select>
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
import { AnyFn, watchDebounced } from "@vueuse/core";
import {
  JSON_SCHEMA,
  SearchableCategory,
  VideoQueryModel,
} from "./search/types";
import { CLIPPER_LANGS } from "@/utils/consts";
import { useI18n } from "vue-i18n";
import VueSelect from "vue-select";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean; // if true, clicking it will replace the prior.
  _raw?: any;
  _idx?: number;
};

export default defineComponent({
  name: "SearchBar",
  components: {
    "vue-select": VueSelect,
  },
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
      default: 680,
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
    const search_query = ref("");
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
    watch(search_query, (newValue) => {
      for (const _key of ["has_song", "type", "lang", "other"] as const)
        ac_opts[_key] = [];
      // clear ^
      console.warn("new value", newValue);
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
      search_query,
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
        if (route.query.search) {
          query.value = await getQueryFromQueryModel(
            route.query as unknown as VideoQueryModel
          );
        }
      },
      { immediate: true }
    );

    return {
      display,
      isMobile,
      orgs,
      orgsEnabled,
      search_query,
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
      return (this.search_query ? this.dropdown : FIRST_SEARCH).map((x, i) => ({
        ...x,
        _idx: i,
      }));
    },
  },
  watch: {
    query() {
      if (this.menuOpen) this.menuOpen = false;
    },
  },
  //   async mounted() {},
  methods: {
    logProps(props: any) {
      console.log(props);
    },
    async commitSearch() {
      if (!this.query || this.query.length === 0) return;

      if (this.query.length === 1 && this.query[0].type === "vtuber") {
        this.$router.push(`/channel/${this.query[0].value}`);
        return;
      }

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
      return v ?? true;
    },
    onEnterKeyDown(e: Event) {
      console.log(this.search_query);
      if (this.search_query === null || this.search_query.length === 0) {
        this.commitSearch();
      } else {
        if (this.results?.[0]?.incomplete) {
          this.search_query = this.results[0].type + ":";
        } else if (this.results?.[0]) {
          this.eventTriggerSelectItem(e, this.results?.[0], () => {
            this.query.push(this.results?.[0]);
          });
          this.search_query = "";
          // e.target?.focus?.();
        }
      }
    },
    eventTriggerSelectItem(e: Event, item: QueryItem, onClick?: AnyFn) {
      if (this.validateItem(item)) {
        // console.log('huh');
        if (item.replace)
          this.query.splice(
            this.query.findIndex(({ type }) => type === item.type),
            1
          );
        onClick?.(e);
      }

      if ((this.autocomplete as any)?.$el) {
        console.log((this.autocomplete as any).$el);
        setTimeout(() => {
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
        }, 200);
      }
    },
    keyHandlers(map: any, vm: any) {
      return {
        ...map,
        13: (e: KeyboardEvent) => {
          // enter key
          e.preventDefault();
          return this.onEnterKeyDown(e);
        },
      };
    },
  },
});
</script>
<style>
@import "./search-bar-vue-select.css";
</style>
<style scoped>
.search-bar {
  max-width: min(v-bind('maxWidth+"px"'), 100%) !important;
}
</style>
<style lang="scss">
.search-bar {
  // width management.
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

  .vs__selected-options {
    // padding-top: 10px;
    // display: block;
    overflow-x: auto;
    overflow-wrap: unset;
    overflow-y: clip;
    // height: 40px;
    white-space: nowrap;
    font-size: 13px;
    line-height: 20px;

    flex-wrap: nowrap;
    align-items: center;

    height: 30px;
    margin-top: 2px;

    scrollbar-width: thin;
    scrollbar-width: 2px;

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
