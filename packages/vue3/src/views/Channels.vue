<template>
  <v-container style="min-height: 70vh">
    <!-- <portal to="mainNavExt" :disabled="!$vuetify.breakpoint.xs || !isActive"> -->
    <!-- <v-tabs v-model="category" class="channels-tabs secondary darken-1">
      <v-tab>{{ $t("views.channels.tabs.Vtuber") }}</v-tab>
      <v-tab>{{ $t("views.channels.tabs.Subber") }}</v-tab>
      <v-tab>{{ $t("views.channels.tabs.Favorites") }}</v-tab>
      <v-tab>{{ $t("views.channels.tabs.Blocked") }}</v-tab>
    </v-tabs> -->

    <div
      class="sticky z-10 flex flex-wrap justify-between px-4 mb-4 top-12 no-scrollbar bg-bgColor-500"
    >
      <div
        class="flex mt-2 overflow-x-auto overflow-y-hidden tabs no-scrollbar"
      >
        <a
          class="tab tab-lg tab-bordered"
          :class="category === 0 ? 'tab-active border-primary' : ''"
          @click="category = 0"
        >
          {{ $t("views.channels.tabs.Vtuber") }}
        </a>
        <a
          class="tab tab-lg tab-bordered"
          :class="category === 1 ? 'tab-active' : ''"
          @click="category = 1"
        >
          {{ $t("views.channels.tabs.Subber") }}
        </a>
        <a
          class="tab tab-lg tab-bordered"
          :class="category === 2 ? 'tab-active' : ''"
          @click="category = 2"
        >
          {{ $t("views.channels.tabs.Favorites") }}
        </a>
        <a
          class="tab tab-lg tab-bordered"
          :class="category === 3 ? 'tab-active' : ''"
          @click="category = 3"
        >
          {{ $t("views.channels.tabs.Blocked") }}
        </a>
      </div>
      <div class="flex gap-2 mt-2">
        <div class="z-40 dropdown dropdown-end">
          <label tabindex="0" class="btn btn-outline">
            {{ currentSortValue.text }}
            <v-icon size="20">{{ mdiArrowDown }}</v-icon>
          </label>
          <ul
            tabindex="0"
            class="z-50 p-2 shadow dropdown-content menu bg-bgColor rounded-box w-52"
          >
            <li
              v-for="(item, index) in sortOptions"
              :key="index"
              link
              @click="sort = item.value"
            >
              <a>{{ item.text }}</a>
            </li>
          </ul>
        </div>

        <!-- Toggle of Card or Row view -->
        <!-- <div class="btn btn-outline" @click="cardView = !cardView">
          <v-icon>
            {{ cardView ? mdiViewModule : mdiViewList }}
          </v-icon>
        </div> -->
      </div>
    </div>

    <!-- Dropdown to pick sort-by into 'sort' data attr -->

    <!-- </portal> -->

    <v-container fluid class="pa-0">
      <channel-list
        :channels="channelList"
        :query="query"
        :variant="cardView ? 'card' : 'list'"
        :grouping="currentSortValue.value"
      ></channel-list>
      <!-- Static channel list with no loading for locally stored blocked/favorites list -->
      <!-- <ChannelList
        :channels="channelList"
        include-video-count
        :grouped="sort === 'group'"
        :card-view="cardView"
        :show-delete="category === Tabs.BLOCKED"
      /> -->
    </v-container>
    <!-- Favorites specific view items: -->
    <template v-if="category === Tabs.FAVORITES">
      <div v-if="!favorites.data.value || favorites.data.value?.length === 0">
        {{ $t("views.channels.favoritesAreEmpty") }}
      </div>
    </template>
    <!-- Blocked list specific view items -->
    <template v-if="category === Tabs.BLOCKED">
      <div
        v-if="
          !settings.blockedChannels || settings.blockedChannels.length === 0
        "
      >
        {{ $t("views.channels.blockedAreEmpty") }}
      </div>
    </template>
  </v-container>
</template>

<script lang="ts">
import { CHANNEL_TYPES } from "@/utils/consts";

import { mdiArrowDown, mdiViewList, mdiViewModule } from "@mdi/js";
import { localSortChannels } from "@/utils/functions";
import { useLangStore, useSiteStore } from "@/stores";
import { useI18n } from "vue-i18n";
import { useFavoritesList } from "@/services/favorites";
import { useSettingsStore } from "@/stores/settings";
import useOrgRouteParamSync from "@/hooks/common/useOrgRouteParamSync";

export default defineComponent({
  name: "Channels",
  //   metaInfo() {
  //     const vm = this;
  //     return {
  //       get title() {
  //         return `${vm.$t("component.mainNav.channels")} - Holodex`;
  //       },
  //     };
  //   },
  setup() {
    const lang = useLangStore();
    const site = useSiteStore();
    const settings = useSettingsStore();
    const { t } = useI18n();

    const sort = ref("subscribers");

    const favorites = useFavoritesList();
    const org = useOrgRouteParamSync();

    return { site, lang, t, sort, favorites, settings, org };
  },
  data() {
    return {
      ...{ mdiArrowDown, mdiViewList, mdiViewModule },
      // perPage: 25,
      identifier: +new Date(),
      // freeze object to stop Vue from creating watchers (small optimization)
      Tabs: {
        VTUBER: 0,
        SUBBER: 1,
        FAVORITES: 2,
        BLOCKED: 3,
      },
      category: 0,
      defaultSort: "subscribers",
      cardView: false,
    };
  },
  computed: {
    sortOptions(): { text: string; value: string; query_value: any }[] {
      return [
        {
          text: this.t("views.channels.sortOptions.subscribers"),
          value: "subscribers",
          query_value: {
            sort: "subscriber_count",
            order: "desc",
          },
        },
        ...((this.category === this.Tabs.VTUBER ||
          this.category === this.Tabs.FAVORITES) &&
        this.site.currentOrg.name !== "All Vtubers"
          ? [
              {
                text: this.$t("views.channels.sortOptions.group"),
                value: "group",
                query_value: {
                  sort: "suborg",
                  order: "asc",
                },
              },
            ]
          : []),
        ...(this.site.currentOrg.name === "All Vtubers"
          ? [
              {
                text: this.$t("views.channels.sortOptions.org"),
                value: "org",
                query_value: {
                  sort: "org",
                  order: "asc",
                },
              },
            ]
          : []),
        {
          text: this.$t("views.channels.sortOptions.videoCount"),
          value: "video_count",
          query_value: {
            sort: "video_count",
            order: "desc",
          },
        },
        ...(this.category === this.Tabs.VTUBER ||
        this.category === this.Tabs.FAVORITES
          ? [
              {
                text: this.$t("views.channels.sortOptions.clipCount"),
                value: "clip_count",
                query_value: {
                  sort: "clip_count",
                  order: "desc",
                },
              },
            ]
          : []),
        ...(this.category === this.Tabs.VTUBER ||
        this.category === this.Tabs.SUBBER
          ? [
              {
                text: "Recently Added",
                value: "recently_added",
                query_value: {
                  sort: "created_at",
                  order: "desc",
                },
              },
            ]
          : []),
      ];
    },
    channelList() {
      if (this.category === this.Tabs.FAVORITES) return this.sortedFavorites;
      if (this.category === this.Tabs.BLOCKED)
        return this.settings.blockedChannels;
      return undefined;
    },
    currentSortValue() {
      const x = this.category;
      return (
        this.findSortValue(this.sort) ||
        (this.findSortValue(this.defaultSort) as {
          text: string;
          value: string;
          query_value: any;
        })
      );
    },
    sortedFavorites() {
      if (this.favorites.data.value)
        return localSortChannels(
          this.favorites.data.value,
          this.currentSortValue.query_value
        );
      else return [];
    },
    isLoggedIn() {
      return !!this.site.user;
    },
    query() {
      const type =
        this.category === this.Tabs.SUBBER
          ? CHANNEL_TYPES.SUBBER
          : CHANNEL_TYPES.VTUBER;
      return {
        type,
        ...(type === CHANNEL_TYPES.VTUBER && {
          org: this.org.name,
        }),
        ...this.currentSortValue.query_value,
      };
    },
  },
  watch: {},
  methods: {
    // changing category also changes sort, which will cause this to trigger twice
    findSortValue(sort: string) {
      return this.sortOptions.find((opt) => opt.value === sort);
    },
  },
});
</script>

<style>
.channel-card-grid::after {
  content: "";
  flex: auto;
}

.channels-tabs .v-slide-group__prev--disabled {
  display: none !important;
}

.rotate-asc {
  transform: rotate(180deg);
}
</style>
