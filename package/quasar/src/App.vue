<template>
    <app-frame />

</template>

<script setup lang="ts">

import { useI18nInitialization } from './hooks/i18n/languageHooks'
import { useThemeInitialization } from './hooks/theme-changer/useThemeInitialization'

// initializing setup for Holodex:
// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
const theme = useThemeInitialization();

// [ ] Login & validation
// todo

</script>