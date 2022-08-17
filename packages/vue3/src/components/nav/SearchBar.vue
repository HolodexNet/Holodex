<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <!-- <span> {{ $t("component.search.searchLabel") }}</span> -->
  <v-autocomplete
    v-model:model-value="query"
    v-model:search="search"
    class="mx-auto search-bar input input-bordered bg-bgColor-500"
    :class="{ 'search-bar-small': isMobile }"
    multiple
    chips
    hide-no-data
    hide-selected
    :rules="[validate]"
    :loading="isLoading"
    :items="results"
    :custom-filter="customFilter"
    item-value="value"
    no-filter
    density="compact"
    variant="plain"
    return-object
    hide-details
    :menu-icon="null"
    @keydown.enter="onEnterKeyDown"
  >
    <template #chip="{ item, props }">
      <div class="px-2 text-gray-100 bg-gray-600 rounded-sm" v-bind="props">
        <span class="font-semibold">{{ i18nItem(item.raw.type) }}: </span>
        <span class="rounded-lg">
          {{ item.raw.text }}
        </span>
      </div>
    </template>
    <template #item="{ item, props }">
      <div v-bind="props" class="px-2 py-1 hover:bg-bgColor-300 cursor-pointer">
        <span class="h-3 text-xs opacity-50">
          <v-icon v-if="item.raw.type === 'channel'" small>
            {{ icons.mdiYoutube }}
          </v-icon>
          <v-icon v-if="item.raw.type === 'video url'" small>
            {{ icons.mdiYoutube }}
          </v-icon>
          <v-icon v-if="item.raw.type === 'topic'" small>
            {{ icons.mdiAnimationPlay }}
          </v-icon>
          <v-icon v-if="item.raw.type === 'org'" small>
            {{ mdiAccountMultiple }}
          </v-icon>
          <v-icon v-if="item.raw.type === 'title & desc'" small>
            {{ mdiTextSearch }}
          </v-icon>
          <v-icon v-if="item.raw.type === 'comments'" small>
            {{ mdiCommentSearch }}
          </v-icon></span
        >
        <span class="ml-2 font-semibold"> {{ i18nItem(item.raw.type) }}: </span>
        <span class="rounded-lg">
          {{ item.raw.text }}
        </span>
      </div>
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

type Query = {
  type: string;
  value: string;
  text: string;
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
      search: "",
      fromApi: [] as Array<Query>,
    };
  },

  computed: {
    results() {
      return this.fromApi;
    },
  },
  watch: {
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
        if (!val) return;
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
                  type: "title & desc",
                  value: `${val}title & desc`,
                  text: val.trim(),
                },
                { type: "comments", value: `${val}comments`, text: val.trim() },
              ];
            }
            this.fromApi = [
              ...res.data.map((x: Query) => {
                if (!x.text) x.text = x.value;
                return x;
              }),
              ...textQueries,
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
        case "title & desc":
          return this.$t("component.search.type.titledesc");
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
  height: 50px;
}

/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
