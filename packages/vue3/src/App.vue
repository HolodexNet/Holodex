<template>
  <app-frame>
    <template #header="{ toggleSidebar }">
      <main-nav @toggle-sidebar="toggleSidebar" />
    </template>
    <template #main>
      <router-view />
    </template>
    <template #sidebar>
      <NavDrawer :pages="pages" />
    </template>

    <report-video />
    <template #footer>
      <selection-panel
        v-if="site.user?.role === 'editor' || site.user?.role === 'admin'"
      />
    </template>
  </app-frame>
</template>

<script setup lang="ts">
import { langs } from "./hooks/i18n/i18nConsts";
import { useI18nInitialization } from "./hooks/i18n/languageHooks";
import { useThemeInitialization } from "./hooks/theme-changer/useThemeInitialization";
import { useLangStore } from "./stores/lang";
import { useSiteStore } from "./stores/site";
import backendApi from "./utils/backend-api";
import { usePlaylistState } from "./stores/playlist";
import { usePlaylist } from "./services/playlist";
import { useMigrateFromHolodexV2 } from "./stores/util/useMigrateFromHolodexV2";
import { CURRENT_PLAYLIST_PROVIDE_KEY } from "./utils/consts";
import { usePages } from "./components/frame/usePages";
const pages = usePages();

const SelectionPanel = defineAsyncComponent(
  () => import("@/components/nav/SelectionControl.vue"),
);

// a XOR variable defining whether or not user has toggled the sidebar
// initializing setup for Holodex:
// Steps:
useMigrateFromHolodexV2();

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
useThemeInitialization();

const router = useRouter();
const site = useSiteStore();

/** Configure global ?org and ?lang listening. */
router.beforeEach((to, from, next) => {
  if (to.name === "Search") return next();
  // ignore Org and Lang stuff.

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
// const playlistVideoCache = usePlaylistVideoIDCache();
const currentPlaylistState = storeToRefs(usePlaylistState());

// /* Configure global playlist video ID cache */
const currentPlaylistQuery = usePlaylist(
  currentPlaylistState.currentPlaylistId,
);

provide(CURRENT_PLAYLIST_PROVIDE_KEY, currentPlaylistQuery);

// [ ] Login & validation
// todo
</script>
