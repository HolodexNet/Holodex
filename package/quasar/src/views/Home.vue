<template>
  <div>
    <!-- :centered="$vuetify.breakpoint.xs"
      :class="
        $store.state.settings.darkMode
          ? 'secondary darken-1'
          : 'primary lighten-1'
      "
      :active-class="
        $store.state.settings.darkMode
          ? 'primary--text text--lighten-3'
          : 'primary--text text--darken-2'
      " -->
    <v-tabs v-model="currentTab" class="mb-2" color="primary">
      <v-tab class="p-2">
        {{ liveUpcomingHeaderSplit[1] }}
        <span
          class="stream-count-chip mx-1 rounded-md bg-primary white--text p-1"
        >
          {{ liveUpcomingCounts.liveCnt }}
        </span>
        {{ liveUpcomingHeaderSplit[2] }}
        <span
          class="stream-count-chip ml-1 rounded-md bg-primary white--text p-1"
        >
          {{ liveUpcomingCounts.upcomingCnt }}
        </span>
      </v-tab>
      <v-tab class="p-2">
        {{ $t("views.home.recentVideoToggles.official") }}
      </v-tab>
      <v-tab class="p-2">
        {{ $t("views.home.recentVideoToggles.subber") }}
      </v-tab>
      <!-- <portal-target
        v-if="!display.breakpoint.xs"
        :name="`date-selector${isFavPage}`"
        class="v-tab ml-auto"
      /> -->
    </v-tabs>
    <video-card-grid>
      <template v-for="video in videos" :key="video.id">
        <video-card :video="video" />
      </template>
    </video-card-grid>
  </div>
</template>
<script setup lang="ts">
import { useLive, useVideos } from "@/services/video";
import { useSiteStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import { Ref } from "vue";
import { useI18n } from "vue-i18n";

const Tabs = {
  LIVE: 0,
  ARCHIVE: 1,
  CLIPS: 2,
} as const;
const currentTab: Ref<typeof Tabs[keyof typeof Tabs]> = ref(Tabs.LIVE);

const site = useSiteStore();

const settings = useSettingsStore();
const { t } = useI18n();
const liveUpcomingHeaderSplit = computed(() => {
  return [...t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/)];
});
const liveUpcomingCounts = computed(() => {
  const liveCnt =
    liveVideos.value?.filter((v) => v.status === "live").length || 0;
  const upcomingCnt = (liveVideos.value?.length || 0) - liveCnt;
  return { liveCnt, upcomingCnt };
});

// TODO:
// paginated: !this.scrollMode,
// ...(this.toDate && {
//   to: nearestUTCDate(dayjs(this.toDate ?? undefined)),
// }),

const liveQuery = useLive(
  computed(() => ({
    status: "live,upcoming",
    org: site.currentOrg.name,
    max_upcoming_hours: 48,
    sort: "available_at",
    order: "asc",
    include: "live_info",
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.LIVE),
  }
);

const archiveQuery = useVideos(
  computed(() => ({
    status: "past,missing",
    type: "stream",
    org: site.currentOrg.name,
    include: "clips",
    max_upcoming_hours: 1,
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.ARCHIVE),
  }
);

const clipQuery = useVideos(
  computed(() => ({
    status: "past",
    type: "clip",
    org: site.currentOrg.name,
    max_upcoming_hours: 1,
    // TODO
    // lang: settings.clipLangs.join(","),
    lang: "en",
  })),
  {
    enabled: computed(() => currentTab.value === Tabs.CLIPS),
  }
);

const { data: archiveVideos } = toRefs(archiveQuery);
const { data: liveVideos } = toRefs(liveQuery);
const { data: clipVideos } = toRefs(clipQuery);
const videos = computed(() => {
  switch (currentTab.value) {
    case 0:
      return liveVideos.value;
    case 1:
      return archiveVideos.value;
    case 2:
      return clipVideos.value;
  }
});
</script>
<style>
.v-slide-group__prev--disabled {
  display: none !important;
}
/* shared with favorites.vue */
.stream-count-chip {
  letter-spacing: normal;
  min-width: 24px;
}
</style>
