<template>
  <!-- https://dev.vuetifyjs.com/en/api/v-autocomplete/#props -->
  <v-autocomplete
    v-model="query"
    class="ma-auto search-bar"
    :class="{ 'search-bar-small': isMobile }"
    solo
    flat
    multiple
    deletable-chips
    chips
    disable-lookup
    clearable
    hide-no-data
    hide-selected
    auto-select-first
    dense
    :rules="[validate]"
    :autofocus="autofocus"
    :small-chips="dense"
    :loading="isLoading"
    :items="results"
    :search-input.sync="search"
    :append-icon="''"
    :label="$t('component.search.searchLabel')"
    :filter="(a, b) => true"
    return-object
    hide-details="auto"
    @input="onInput"
    @keydown.enter="onEnterKeyDown"
  >
    <template #selection="selection">
      <v-card
        :color="$vuetify.theme.dark ? 'grey darken-3' : 'primary accent-4'"
        :label="selection.item.type !== 'channel'"
        class="pa-0 selected-card"
        :dark="$vuetify.theme.dark"
      >
        <v-list-item class="ma-n1 py-0 pl-3 pr-1">
          <div class="selected-card-type px-1 py-0 ma-0 rounded text--disabled caption">
            <v-icon v-if="selection.item.type === 'channel'" x-small>
              {{ icons.mdiYoutube }}
            </v-icon>
            <v-icon v-if="selection.item.type === 'video url'" x-small>
              {{ icons.mdiYoutube }}
            </v-icon>
            <v-icon v-if="selection.item.type === 'topic'" x-small>
              {{ icons.mdiAnimationPlay }}
            </v-icon>
            <v-icon v-if="selection.item.type === 'org'" x-small>
              {{ mdiAccountMultiple }}
            </v-icon>
            <v-icon v-if="selection.item.type === 'title & desc'" x-small>
              {{ mdiTextSearch }}
            </v-icon>
            <v-icon v-if="selection.item.type === 'comments'" x-small>
              {{ mdiCommentSearch }}
            </v-icon>
            {{ i18nItem(selection.item.type) }}
          </div>

          <v-list-item-content class="py-1 pt-4">
            <v-list-item-subtitle class="text--primary search-item" v-text="selection.item.text" />
          </v-list-item-content>

          <v-list-item-action>
            <v-icon
              small
              :color="$vuetify.theme.dark ? 'primary accent-2' : 'secondary lighten-3'"
              @click="deleteChip(selection.item)"
            >
              {{ icons.mdiClose }}
            </v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-card>
    </template>
    <template #item="dropdownItem">
      <div class="ma-n1 py-0 pl-3 pr-1">
        <!-- @click="addItem(dropdownItem.item) -->
        <v-list-item-content class="py-1 pt-1">
          <v-list-item-subtitle class="text--primary">
            {{ i18nItem(dropdownItem.item.type) }}
            <v-icon v-if="dropdownItem.item.type === 'channel'" small>
              {{ icons.mdiYoutube }}
            </v-icon>
            <v-icon v-if="dropdownItem.item.type === 'video url'" small>
              {{ icons.mdiYoutube }}
            </v-icon>
            <v-icon v-if="dropdownItem.item.type === 'topic'" small>
              {{ icons.mdiAnimationPlay }}
            </v-icon>
            <v-icon v-if="dropdownItem.item.type === 'org'" small>
              {{ mdiAccountMultiple }}
            </v-icon>
            <v-icon v-if="dropdownItem.item.type === 'title & desc'" small>
              {{ mdiTextSearch }}
            </v-icon>
            <v-icon v-if="dropdownItem.item.type === 'comments'" small>
              {{ mdiCommentSearch }}
            </v-icon>

            {{ dropdownItem.item.text }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </div>
    </template>
    <template #append-outer>
      <v-btn class="ml-1 append-btn" @click="commitSearch">
        <v-icon
          key="searchbtn"
          color="secondary"
          v-text="icons.mdiMagnify"
        />
      </v-btn>
      <v-btn class="ml-1 append-btn" @click="goToOrToggleAdvanced">
        <v-icon
          key="advanced"
          color="secondary"
          v-text="mdiFilter"
        />
      </v-btn>
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
import debounce from "lodash-es/debounce";
import { json2csvAsync, csv2jsonAsync } from "json-2-csv";

export default {
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
    data() {
        return {
            query: [],
            mdiLabel,
            mdiAccountMultiple,
            mdiMagnifyPlusOutline,
            mdiTextSearch,
            mdiCommentSearch,
            mdiFilter,
            isLoading: false,
            search: null,
            fromApi: [],
        };
    },
    computed: {
        isMobile() {
            return this.$store.state.isMobile;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        results() {
            return this.fromApi.concat(this.query ? this.query : []);
        },
        nameProperty() {
            return this.$store.state.settings.nameProperty;
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
        $route(to) {
            // on non-channel pages, remove default channel query if it exists
            if (this.query[0]?.$default && !to.path.startsWith("/channel/")) {
                this.query.splice(0, 1);
            }
        },
        "$store.state.channel.channel": function () {
            // on channel pages, default the query to include channel
            // console.log("$store.state.channel:", structuredClone(this.$store.state.channel), "query[0]:", this.query[0]);
            if (this.query.length > 0 && !this.query[0].$default) return;
            const { channel } = this.$store.state;
            if (!channel?.channel || channel.isLoading || channel.hasError) return;
            const defaultQuery = {
                type: "channel",
                value: channel.channel.id,
                text: channel.channel.name,
                $default: true,
            };
            if (this.query.length === 0) {
                this.query.push(defaultQuery);
            } else {
                this.query.splice(0, 1, defaultQuery);
            }
        },
        // eslint-disable-next-line func-names
        search: debounce(function (val) {
            if (!val) return;
            this.fromApi = [];
            const entropy = encodeURIComponent(val.trim()).length;
            if (entropy <= 1) return;
            const formatted = val.trim().replace("#", "");
            this.getAutocomplete(formatted)
                .then((res) => {
                    let textQueries = [];
                    if (encodeURIComponent(val).length > 1) {
                        textQueries = [
                            {
                                type: "none",
                                disabled: true,
                                divider: true,
                                value: "div",
                                text: "div",
                            },
                            { type: "title & desc", value: `${val}title & desc`, text: val.trim() },
                            {
                                type: "none",
                                disabled: true,
                                divider: true,
                                value: "div",
                                text: "div",
                            },
                            { type: "comments", value: `${val}comments`, text: val.trim() },
                        ];
                    }
                    this.fromApi = [...res.data, ...textQueries];
                })
                .catch((e) => console.log(e));
        }, 500),
    },
    async mounted() {
        if (this.$route.query && this.$route.query.q) {
            this.query = await csv2jsonAsync(this.$route.query.q);
        }
    },
    methods: {
        async getAutocomplete(query) {
            this.isLoading = true;
            const res = await api.searchAutocomplete(query);
            res.data = res.data.map((x) => {
                if (!x.text) x.text = x.value;
                return x;
            });
            this.isLoading = false;
            return res;
        },
        deleteChip(item) {
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
                        advanced: !(this.$route.query.advanced === "true"),
                        page: undefined,
                    },
                });
            } else {
                // go to
                this.$router.push({
                    path: "/search",
                    query: {
                        q: await json2csvAsync(this.query),
                        advanced: true,
                        page: undefined,
                    },
                });
            }
        },
        addItem(item) {
            // console.log(item);
            this.query.push({ ...item });
        },
        onInput() {
            this.search = null;
            this.fromApi = [];
        },
        validate(currentQuery) {
            // current limitations:
            // if more than 1 comment search, fail
            // if text search AND comment search, fail
            const countcomments = currentQuery.filter((x) => x.type === "comments").length;
            if (countcomments > 1) return "Cannot search using multiple comment conditions.";
            if (countcomments === 1 && currentQuery.filter((x) => x.type === "title & desc").length > 0) {
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
    },
};
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
