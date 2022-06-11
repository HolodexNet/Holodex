<template>
    <app-frame />

    <VueQueryDevToolsPanel />
</template>

<script setup lang="ts">

import { useI18nInitialization } from './hooks/i18n/useI18nInitialization'
import { useThemeInitialization } from './hooks/theme-changer/useThemeInitialization'
import { VueQueryDevToolsPanel } from "vue-query/devtools";

// initializing setup for Holodex:
// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
const theme = useThemeInitialization();

// [ ] Login & validation
// todo

</script>