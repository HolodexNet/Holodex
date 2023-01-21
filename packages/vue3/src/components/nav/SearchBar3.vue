<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <!-- <span> {{ $t("component.search.searchLabel") }}</span> -->
  <!--     :custom-filter="customFilter"  -->
  <!-- <Multiselect mode="tags"></Multiselect> -->
  <Multiselect
    ref="autocomplete"
    v-model="query"
    mode="tags"
    :options="results"
    class="mx-auto search-bar group"
    :class="{ 'search-bar-small': isMobile }"
    :loading="isLoading"
    :placeholder="$t('component.search.searchLabel')"
    label="Search"
    :object="true"
    :filter-results="false"
    value-prop="_key"
    input-type="text"
    :searchable="true"
    :can-clear="false"
    :create-option="false"
    :clear-on-blur="false"
    :clear-on-select="false"
    :append-new-option="false"
    :on-create="(opt: any, $c: any) => { logWithContext('precreate')(opt); return false; }"
    @search-change="(q: string) => {
      search = q;
    }"
    @keydown="(evt: KeyboardEvent) => {
      if(evt.key === 'Enter') {
        logWithContext('enter-down')(evt.key)
        // onEnterKeyDown(evt);
        evt.stopImmediatePropagation();
      }
      else if(evt.key !== 'ArrowDown' && evt.key !== 'ArrowUp') {
        (autocomplete as any).clearPointer();
      }
    }"
    @keyup="(evt: KeyboardEvent) => {
      if(evt.key === 'Enter') {
        logWithContext('enter-up')(evt.key)
        evt.stopImmediatePropagation();
      }
    }"
    @focus="
      () => {
        if (!orgsEnabled) orgsEnabled = true;
      }
    "
    @select="undoIfIncomplete"
    @option="(v: any) => logWithContext('option')({v, query}) /* i dont think this gets triggered. */"
  >
    <template #caret>
      <div
        v-if="query.length == 0 || search.length > 0"
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
    <template #beforelist>
      <!-- MENU MAIN HEADER [Search Options.... Learn More <help>]-->
      <template v-if="results[0]?.incomplete">
        <div class="py-2 pl-8 pr-4 text-xs flex font-extrabold bg-bgColor">
          <span class="cursor-default">{{
            $t("search.menu_header_text")
          }}</span>
          <a class="opacity-50 inline-flex ml-auto" href="#" :tabindex="40">
            <span>{{ $t("search.guide_btn") }}</span>
            <div class="ml-1 text-[16px] i-ion:help-circle-outline"></div>
          </a>
        </div>
      </template>
      <v-progress-linear
        indeterminate
        :class="autocomplete_loading && '-mb-2'"
        color="accent"
        :active="autocomplete_loading"
      ></v-progress-linear>
    </template>
    <template #afterlist> </template>
    <template #nooptions>...</template>
    <template #tag="{ option: item, handleTagRemove /*, disabled*/ }">
      <div
        class="px-1 mr-1 tracking-tight badge badge-ghost bg-bgColor border-0 text-xs rounded-sm font-semibold hover:badge-error cursor-default"
        @click="handleTagRemove(item, $event)"
      >
        <span class=""> {{ categoryName(item) }}: </span>
        <span class="rounded-lg ml-1"> {{ categoryValue(item) }} </span>
      </div>
    </template>
    <template #option="{ option: item, isPointed /* isSelected, search */ }">
      <!-- INCOMPLETE SEARCH ITEMS -->
      <template v-if="item.incomplete">
        <div
          class="px-2 py-1 cursor-pointer text-sm flex hover:bg-bgColor-300"
          :class="{
            'bg-bgColor-200': isPointed(item),
          }"
          :tabindex="item._idx + 2"
          @click.stop="
            (e) => {
              eventTriggerSelectItem(e, item, () => {
                search = categoryName(item) + ': ';
              });
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
          v-if="results[item._idx].type !== results[item._idx - 1]?.type"
          class="pb-1 pt-2 pl-8 cursor-default flex text-xs font-extrabold uppercase border-t-2 border-bgColor-50"
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
          :class="{
            'bg-bgColor-200': isPointed(item),
          }"
          @keydown.enter.stop="
            (e) =>
              eventTriggerSelectItem(e, item, () => {
                query.push(item);
                search = '';
              })
          "
          @click.stop="
            (e) =>
              eventTriggerSelectItem(e, item, () => {
                query.push(item);
                search = '';
              })
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
            v-if="isPointed(item)"
            class="ml-auto opacity-25 i-icon-park-solid:enter-key-one mt-1"
          ></div>
        </div>
      </template>
    </template>
  </Multiselect>
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
import Multiselect from "@vueform/multiselect";
import { xor } from "lodash";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean; // if true, clicking it will replace the prior.
  _raw?: any;
  _idx?: number;
  _key?: string;
};

export default defineComponent({
  name: "SearchBar",
  components: {
    Multiselect,
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
      // reflect value back to input
      if (
        autocomplete.value &&
        (autocomplete.value as any)?.search !== newValue
      ) {
        (autocomplete.value as any).search = newValue;
      }

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
        if (route.query) {
          query.value = (
            await getQueryFromQueryModel(
              route.query as unknown as VideoQueryModel
            )
          ).map((x) => ({
            ...x,
            _key: x.type + x.value,
          }));
          console.log("creating_query", query.value);
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
      return (this.search ? this.dropdown : FIRST_SEARCH).map((x, i) => ({
        ...x,
        _idx: i,
        _key: x.type + x.value,
      }));
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
    onEnterKeyDown(e: Event) {
      this.logWithContext("enter")(this.search);
      this.logWithContext("current-pointer")(
        (this.autocomplete as any).pointer
      );
      if (this.search === null || this.search.length === 0) {
        this.commitSearch();
      } else {
        this.logWithContext("enter->autocomplete")(this.autocomplete);
        if (this.results?.[0]?.incomplete) {
          this.search = this.categoryName(this.results[0]) + ":";
        } else if (this.results?.[0]) {
          this.eventTriggerSelectItem(e, this.results?.[0], () => {
            this.query.push(this.results?.[0]);
          });
          this.search = "";
        }
      }
      this.tryFocusInput();
    },
    eventTriggerSelectItem(e: Event, item: QueryItem, onClick?: AnyFn) {
      if (this.validateItem(item)) {
        this.logWithContext("trigger-event")(item);
        // console.log('huh');
        if (item.replace)
          this.query.splice(
            this.query.findIndex(({ type }) => type === item.type),
            1
          );

        onClick?.(e);
        this.logWithContext("reset-search-trigger")(item);
      }

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
        }, 200);
    },
    undoIfIncomplete(item: QueryItem) {
      this.logWithContext("selected:")(item);
      if (item.incomplete || item.value === undefined || item.value === "") {
        this.query.pop(); // undo the insertion
        this.search = this.categoryName(item) + ": ";
        this.tryFocusInput();
        return;
      }
      if (item.replace)
        this.query.splice(
          this.query.findIndex(({ type }) => type === item.type),
          1
        );

      this.search = ""; // successful

      this.tryFocusInput();
    },
  },
});
</script>
<style scoped>
.search-bar {
  max-width: min(v-bind('maxWidth+"px"'), 100%) !important;
}
</style>
<style>
@import "multiselect-tw.css";
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

    flex-wrap: nowrap;

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
