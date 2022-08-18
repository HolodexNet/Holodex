<template>
  <v-app>
    <main-nav />
    <!-- Sizes your content based upon application components -->
    <v-main class="bg-bgColor-700">
      <!-- Provides the application the proper gutter -->
      <!-- If using vue-router -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import route from "color-convert/route";
import { langs } from "./hooks/i18n/i18nConsts";
import { useI18nInitialization } from "./hooks/i18n/languageHooks";
import { useThemeInitialization } from "./hooks/theme-changer/useThemeInitialization";
import { useLangStore } from "./stores/lang";
import { useSiteStore } from "./stores/site";
import backendApi from "./utils/backend-api";

// initializing setup for Holodex:
// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
const theme = useThemeInitialization();

const router = useRouter();
/** Configure global ?org and ?lang listening. */
const releaseOrgGuardListenerFn = router.beforeEach((to, from, next) => {
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

// [ ] Login & validation
// todo
</script>
