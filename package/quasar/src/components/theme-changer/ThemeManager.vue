<template>
    <div></div>
</template>
<script lang="ts">

import { useLocalStorage } from '@vueuse/core'
import { colors, Dialog } from 'quasar'

import { useThemeStore } from './helpers'

export default defineComponent({
    computed: {
    },
    methods: {
        openThemeCustomizationDialog() {
            // Dialog.create({
            //     component: ThemeCustomizationDialog,
            // })
        },
    },
    setup() {
        const theme = useThemeStore();
        if (window.currentTheme !== theme.name) {
            theme.init();
            window.currentTheme = theme.name;
        }
        return { theme }
    },
})


</script>