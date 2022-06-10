<template>
    <app-frame />
</template>

<script setup lang="ts">

import { useI18nInitialization } from './hooks/i18n/useI18nInitialization'
import { useThemeInitialization } from './hooks/theme-changer/useThemeInitialization'

// initializing setup for Holodex:
// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
useThemeInitialization();

// [ ] Login & validation
// todo

</script>