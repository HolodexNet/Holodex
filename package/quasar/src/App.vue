<template>
    <app-frame />
</template>

<script setup lang="ts">
// initializing setup for Holodex:

import { useThemeInitialization } from './components/core/theme-changer/useThemeInitialization';
import { useI18nInitialization } from './i18n/useI18nInitialization';

// Steps:

// [done] Restore Language settings
useI18nInitialization();

// [done] theme setting (within theme-manager).
useThemeInitialization();

// [ ] Login & validation
// todo

</script>