<template>
  <v-app>
    <main-nav />
    <!-- Sizes your content based upon application components -->
    <v-main class="bg-base-300">
      <!-- Provides the application the proper gutter -->
      <!-- If using vue-router -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useI18nInitialization } from "./hooks/i18n/languageHooks";
import { useThemeInitialization } from "./hooks/theme-changer/useThemeInitialization";

// initializing setup for Holodex:
// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
const theme = useThemeInitialization();

// [ ] Login & validation
// todo
</script>
