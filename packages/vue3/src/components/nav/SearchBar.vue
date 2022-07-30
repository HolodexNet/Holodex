<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <v-autocomplete
    v-model:model-value="query"
    v-model:search="search"
    class="ma-auto search-bar"
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
    :label="$t('component.search.searchLabel')"
    return-object
    @keydown.enter="onEnterKeyDown"
  >
    <template #chip="{ item, props }">
      <v-chip
        v-bind="props"
        :color="'grey darken-3'"
        class="pa-0 selected-card"
      >
        {{ item.raw }}
      </v-chip>
    </template>
    <template #item="{ item, props }">
      <div v-bind="props" class="py-0 pl-3 pr-1">
        <v-list-item-header>
          {{ item.raw.text }}, {{ props }}
        </v-list-item-header>
        <div class="py-1 pt-1">
          <v-list-item-subtitle class="text--primary">
            {{ i18nItem(item.raw.type) }}
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
            </v-icon>
          </v-list-item-subtitle>
        </div>
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
    addItem(item) {
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
    i18nItem(item) {
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
  max-width: 670px !important;

  &.search-bar-small {
    max-width: 90vw !important;
  }

  .selected-card {
    margin: 3px;
    max-width: 100%;
    min-width: 80px;
    overflow: hidden;
  }

  &.v-input > .v-input__control {
    height: auto !important;
    // min-height: 47px !important;
  }

  input {
    padding-left: 10px !important;
  }

  &.v-input--dense > .v-input__append-outer {
    // min-height: 47px !important;
    min-width: 38px;
    height: 100%;
    margin: 0 !important;
    background-color: none;
    border-radius: inherit;

    .append-btn {
      min-height: 40px;
      min-width: 45px;
      max-width: 45px;
    }
  }

  .v-messages.theme--dark.error--text {
    background-color: rgb(30, 30, 30);
    font-weight: 600;
    padding: 2px;
    border-radius: 2px;
  }

  .selected-card-type {
    position: absolute;
    top: 3px;
    left: 3px;
    background-color: rgba(100, 100, 100, 0.3);
    line-height: 1rem;
  }

  &.v-input .v-input__slot {
    padding-left: 1px !important;
    padding-top: 1px !important;
  }

  & > .v-input__append-outer {
    flex-shrink: 0;
    align-items: center;
  }

  & > .v-input__append-outer > .v-input__icon > .v-icon.primary--text {
    color: white !important;
  }

  & > .v-input__control > .v-input__slot > .v-select__slot > label {
    left: 10px !important;
  }
}
.v-autocomplete__content.v-menu__content {
  translate: 0 -4px;
}

/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
