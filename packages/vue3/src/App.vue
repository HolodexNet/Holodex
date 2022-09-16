<template>
  <v-app>
    <main-nav />
    <!-- Sizes your content based upon application components -->
    <v-main class="bg-bgColor-600">
      <!-- Provides the application the proper gutter -->
      <!-- If using vue-router -->
      <router-view />
    </v-main>

    <report-video />
    <selection-control />
  </v-app>
</template>

<script setup lang="ts">
import { langs } from "./hooks/i18n/i18nConsts";
import { useI18nInitialization } from "./hooks/i18n/languageHooks";
import { useThemeInitialization } from "./hooks/theme-changer/useThemeInitialization";
import { useLangStore } from "./stores/lang";
import { useSiteStore } from "./stores/site";
import backendApi from "./utils/backend-api";
import { usePlaylistState, usePlaylistVideoIDCache } from "@/stores/playlist";
import { usePlaylist } from "@/services/playlist";
import { useMigrateFromHolodexV2 } from "./stores/util/useMigrateFromHolodexV2";

// initializing setup for Holodex:
// Steps:
useMigrateFromHolodexV2();

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
useThemeInitialization();

const router = useRouter();
/** Configure global ?org and ?lang listening. */
router.beforeEach((to, from, next) => {
  if (to.query.lang) {
    if (
      useLangStore().lang !== to.query.lang &&
      langs.find((x) => x.val === to.query.lang)
    ) {
      useLangStore().lang = to.query.lang as any;
    }
  }

  const queryOrg = to.query.org;
  if (queryOrg) {
    const site = useSiteStore();
    if (site.currentOrg.name !== queryOrg) {
      backendApi.orgs().then((orgs: Org[]) => {
        const overrideOrg = orgs.find((o) => o.name === queryOrg);
        if (overrideOrg) site.currentOrg = overrideOrg;
      });
    } else {
      delete to.query.org;
      return next(to);
    }
  }

  next();
});

/* --- Maintain Playlist Cache Lifecycle ---  */
const playlistVideoCache = usePlaylistVideoIDCache();
const currentPlaylistState = storeToRefs(usePlaylistState());

/* Configure global playlist video ID cache */
const currentPlaylistQuery = usePlaylist(
  currentPlaylistState.currentPlaylistId,
  {
    onSettled(data, err) {
      console.log("reset currently active playlist:", data);
      if (data)
        playlistVideoCache.setOfIds = new Set(data.videos?.map((x) => x.id));
      else playlistVideoCache.setOfIds = new Set();
    },
  }
);

watchEffect(() => {
  if (currentPlaylistQuery.data.value) {
    playlistVideoCache.setOfIds = new Set(
      currentPlaylistQuery.data.value?.videos?.map((x) => x.id)
    );
  } else playlistVideoCache.setOfIds = new Set();
});

provide("currentPlaylist", currentPlaylistQuery);

// [ ] Login & validation
// todo
</script>
