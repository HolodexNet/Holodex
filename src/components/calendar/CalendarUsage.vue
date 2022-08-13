<template>
  <v-sheet class="" rounded="none" border-color="primary">
    <v-text-field
      label="Live Calendar (iCal)"
      :value="liveCalendarURL"
      readonly
      hide-details
      regular
      @click.stop="copyToClipboard(liveCalendarURL, $event)"
    />

    <v-snackbar v-model="snackbar" :timeout="1000" color="green">
      {{ $t("component.videoCard.copiedToClipboard") }}
    </v-snackbar>

    <v-autocomplete
      v-model="query"
      persistent-hint
      :items="results"
      :loading="isLoading"
      :search-input.sync="searchInput"
      :filter="(a, b) => true"
      :append-icon="''"
      label="Filter by Topic, Org, Channel ..."
      class="calendar-search-bar"
      :class="{ 'search-bar-small': false }"
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
      return-object
      hide-details="auto"
      :small-chips="false"
      :autofocus="false"
      :prepend-inner-icon="mdiFilter"
      @input="onInput"
      @change="constrainQuery"
    >
      <template #selection="selection">
        <v-card
          :color="$vuetify.theme.dark ? 'grey darken-3' : 'primary accent-4'"
          :label="selection.item.type !== 'channel'"
          class="pa-0 selected-card"
          :dark="$vuetify.theme.dark"
        >
          <v-list-item class="ma-n1 py-0 pl-3 pr-1">
            <div
              class="selected-card-type px-1 py-0 ma-0 rounded text--disabled caption"
            >
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
              <v-list-item-subtitle
                class="text--primary search-item"
                v-text="selection.item.text"
              />
            </v-list-item-content>

            <v-list-item-action>
              <v-icon
                small
                color="primary accent-2"
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
    </v-autocomplete>

    <v-divider class="my-3" />

    <v-text-field
      v-if="isLoggedIn && showFavoritesCalendar"
      label="Favorites Calendar (iCal)"
      :value="favoritesCalendarURL"
      readonly
      hide-details
      regular
      @click.stop="copyToClipboard(favoritesCalendarURL, $event)"
    />

    <v-switch
      v-model="preferEnglishName"
      class="v-input--reverse v-input--expand"
      inset
      :label="$t('views.settings.useEnglishNameLabel')"
      :messages="$t('views.settings.useEnglishNameLabel')"
      hide-details
    />
  </v-sheet>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import debounce from "lodash-es/debounce";
import {
    mdiLabel,
    mdiAccountMultiple,
    mdiTextSearch,
    mdiFilter,
    mdiCommentSearch,
    mdiClipboardPlusOutline,
} from "@mdi/js";

export default {
    name: "CalendarUsage",
    props: {
        initialQuery: {
            type: Array,
        },
        showFavoritesCalendar: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            query: [],
            fromApi: [],
            searchInput: null,
            isLoading: false,
            snackbar: false,

            mdiLabel,
            mdiAccountMultiple,
            mdiTextSearch,
            mdiCommentSearch,
            mdiFilter,
            mdiClipboardPlusOutline,
        };
    },
    computed: {
        results() {
            return this.fromApi.concat(this.query ? this.query : []);
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
        preferEnglishName: {
            get() {
                return this.$store.getters["settings/useEnName"];
            },
            set(val) {
                this.$store.commit("settings/setUseEnName", val);
            },
        },
        liveCalendarURL() {
            const bucket = this.query.reduce((b, { type, value }) => {
                b[type] ||= [];
                b[type].push(value);
                return b;
            }, {});

            // if (bucket.channel) {
            //   // correcting a typo on the server that expects channelId instead of channel?
            //   bucket.channelId = bucket.channel;
            //   delete bucket.channel;
            // }
            const params = {
                ...bucket,
                ...(this.preferEnglishName ? { preferEnglishName: 1 } : null),
            };
            return `https://holodex.net/live.ics?${new URLSearchParams(
                params,
            ).toString()}`;
        },
        favoritesCalendarURL() {
            const { user } = this.$store.state.userdata;

            if (!user.api_key) { return `You need an API Key. Click${this.$t("views.login.apikeyNew")}`; }
            const params = {
                key: user.api_key || "",
                ...(this.preferEnglishName ? { preferEnglishName: 1 } : null),
            };
            return `https://holodex.net/favorites.ics?${new URLSearchParams(
                params,
            ).toString()}`;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        searchInput: debounce(function (val) {
            if (!val) return;
            const queryLength = encodeURIComponent(val.trim()).length;
            if (queryLength <= 1) return;
            this.fromApi = [];
            const formatted = val.trim().replace("#", "");
            this.fetchAutocomplete(formatted)
                .then((channels) => {
                    this.fromApi = channels.filter(
                        (x) => x.type === "topic" || x.type === "channel" || x.type === "org",
                    );
                })
                .catch((e) => console.log(e));
        }, 500),
    },
    async mounted() {
        if (this.initialQuery) {
            const parsedQuery = this.initialQuery;
            this.query = parsedQuery;
        }
    },
    methods: {
        constrainQuery() {
            if (this.query.filter((x) => x.type === "org").length > 1) {
                this.query.splice(
                    this.query.findIndex((x) => x.type === "org"),
                    1,
                );
            }
        },
        async copyToClipboard(url, ev) {
            ev.target.classList.add("green");
            await navigator.clipboard.writeText(url);
            this.snackbar = true;
            setTimeout(() => {
                ev.target.classList.remove("green");
            }, 1000);
        },
        onInput() {
            this.searchInput = null;
            this.fromApi = [];
        },
        async fetchAutocomplete(query) {
            this.isLoading = true;
            const res = await backendApi.searchAutocomplete(query);
            const result = res.data.map((x) => {
                if (!x.text) x.text = x.value;
                return x;
            });
            this.isLoading = false;
            return result;
        },
        deleteChip(item) {
            this.query.splice(this.query.map((q) => q.value).indexOf(item.value), 1);
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
    },
};
</script>

<style lang="scss">
.calendar-search-bar {
  margin-top: 10px !important;

  .v-input__slot {
    padding: 0 !important;

    .v-list-item__content {
      padding: 0 !important;
    }

    .selected-card {
      margin-right: 5px;
    }
  }
}
</style>
