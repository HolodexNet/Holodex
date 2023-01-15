<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <!-- <span> {{ $t("component.search.searchLabel") }}</span> -->
  <v-autocomplete
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
        if (!search) {
          query.pop();
        }
      }
    "
    @keydown.enter="onEnterKeyDown"
  >
    <template #append-item> <a>How to search on Holodex?</a> </template>
    <template #append-inner>
      <div class="opacity-40 i-ion:search" style="margin-top: 2px"></div>
    </template>

    <template #chip="{ item, props }">
      <div
        class="px-1 mr-1 tracking-tight badge badge-ghost bg-bgColor border-0 text-xs rounded-sm font-semibold hover:badge-error cursor-default"
        v-bind="props"
        @click="props['onClick:close']"
      >
        <span class="">
          <!-- <div
            class="inline-block align-middle cursor-pointer i-mdi:close"
            @click="props['onClick:close']"
          ></div> -->
          {{ i18nItem(item.raw.type) }}:
        </span>
        <span class="rounded-lg">
          {{ item.raw.text }}
        </span>
      </div>
    </template>
    <template #item="{ item, index, props }">
      <template v-if="item.raw.first_search">
        <div
          v-bind="props"
          class="px-2 py-1 cursor-pointer flex hover:bg-bgColor-300"
        >
          <span
            class="inline-block opacity-50 h-6"
            :class="
              icons.search[item.raw.type] || 'i-fluent:grid-dots-20-regular'
            "
          ></span>
          <span class="ml-2 font-light">
            {{ i18nItem(item.raw.type) || item.raw.type }}:
          </span>
        </div>
      </template>
      <template v-else>
        <div
          v-if="results[index].type !== results[index - 1]?.type"
          class="pt-2 pb-2 pl-8 cursor-default flex text-xs font-extrabold uppercase border-t-2 border-bgColor-50"
        >
          {{ i18nItem(item.raw.type) }}
        </div>
        <div
          v-bind="props"
          class="px-2 py-1 cursor-pointer flex hover:bg-bgColor-300"
        >
          <span
            class="inline-block opacity-50 h-6"
            :class="
              icons.search[item.raw.type] || 'i-fluent:grid-dots-20-regular'
            "
          ></span>
          <span class="ml-2 font-light"> {{ i18nItem(item.raw.type) }}: </span>
          <span>
            {{ item.raw.text }}
          </span>
        </div>
      </template>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import {
  mdiLabel,
  mdiMagnifyPlusOutline,
  mdiAccountMultiple,
  mdiTextSearch,
  mdiFilter,
  mdiCommentSearch,
} from "@mdi/js";
import api from "@/utils/backend-api";
// import debounce from "lodash-es/debounce";
import { json2csvAsync, csv2jsonAsync } from "json-2-csv";
// import { useLangStore } from "@/stores/lang";
import { useDisplay } from "vuetify";
import { FIRST_SEARCH } from "./search_consts";

type Query = {
  type: string;
  value: string;
  text: string;
  first_search?: boolean;
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

    const isMobile = display.mobile;

    return { display, isMobile };
  },
  data() {
    return {
      query: [] as Array<Query>,
      mdiLabel,
      mdiAccountMultiple,
      mdiMagnifyPlusOutline,
      mdiTextSearch,
      mdiCommentSearch,
      mdiFilter,
      isLoading: false,
      menuOpen: false,
      search: "",
      fromApi: [] as Array<Query>,
    };
  },

  computed: {
    results() {
      return this.search ? this.fromApi : FIRST_SEARCH;
    },
  },
  watch: {
    query() {
      if (this.menuOpen) this.menuOpen = false;
    },
    "$route.query": {
      deep: true,
      async handler({ q }) {
        if (q) {
          this.query = await csv2jsonAsync(q);
        }
      },
    },
    // eslint-disable-next-line func-names
    search: {
      handler: function (val: string) {
        if (!val) return FIRST_SEARCH;
        this.fromApi = [];
        const entropy = encodeURIComponent(val.trim()).length;
        if (entropy <= 1) return;
        const formatted = val.trim().replace("#", "");
        this.getAutocomplete(formatted)
          .then((res) => {
            let textQueries: Query[] = [];
            if (encodeURIComponent(val).length > 1) {
              textQueries = [
                {
                  type: "title",
                  value: `${val}`,
                  text: val.trim(),
                },
                // { type: "comments", value: `${val}comments`, text: val.trim() },
              ];
            }
            this.fromApi = [
              ...textQueries,
              ...res.data.map((x: Query) => {
                if (!x.text) x.text = x.value;
                return x;
              }),
            ];
            console.log(JSON.stringify(this.fromApi, undefined, 2));
          })
          .catch((e) => console.log(e));
      },
    },
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
    async getAutocomplete(query: string) {
      this.isLoading = true;
      const res = await api.searchAutocomplete(query);
      this.isLoading = false;
      return res;
    },
    deleteChip(item: Query) {
      this.query.splice(this.query.map((q) => q.value).indexOf(item.value), 1);
    },
    async commitSearch() {
      if (!this.query || this.query.length === 0) return;

      if (this.query.length === 1 && this.query[0].type === "channel") {
        this.$router.push(`/channel/${this.query[0].value}`);
        return;
      }

      if (this.query.length === 1 && this.query[0].type === "video url") {
        this.$router.push(`/watch/${this.query[0].value}`);
        return;
      }

      this.$router.push({
        path: "/search",
        query: {
          ...this.$route.query,
          q: await json2csvAsync(this.query),
          page: undefined,
        },
      });
    },
    async goToOrToggleAdvanced() {
      if (this.$route.name === "search") {
        // toggle
        this.$router.push({
          path: "/search",
          query: {
            ...this.$route.query,
            q: await json2csvAsync(this.query),
            advanced: String(!(this.$route.query.advanced === "true")),
            page: undefined,
          },
        });
      } else {
        // go to
        this.$router.push({
          path: "/search",
          query: {
            q: await json2csvAsync(this.query),
            advanced: "true",
            page: undefined,
          },
        });
      }
    },
    addItem(item: any) {
      // console.log(item);
      this.query.push({ ...item });
    },
    validate(currentQuery: Query[]) {
      // current limitations:
      // if more than 1 comment search, fail
      // if text search AND comment search, fail
      const countcomments = currentQuery.filter(
        (x) => x.type === "comments"
      ).length;
      if (countcomments > 1)
        return "Cannot search using multiple comment conditions.";
      if (
        countcomments === 1 &&
        currentQuery.filter((x) => x.type === "title & desc").length > 0
      ) {
        return "Cannot search using comment + title & desc filters at the same time.";
      }
      return true;
    },
    i18nItem(item: any) {
      switch (item) {
        case "channel":
          return this.$t("component.search.type.channel");
        case "video url":
          return this.$t("component.search.type.videourl");
        case "topic":
          return this.$t("component.search.type.topic");
        case "org":
          return this.$t("component.search.type.org");
        case "title":
          return this.$t("component.search.type.title");
        case "comments":
          return this.$t("component.search.type.comments");
        default:
          return "";
      }
    },
    onEnterKeyDown() {
      if (this.search === null || this.search.length === 0) {
        this.commitSearch();
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
