<template>
    <v-row v-if="isLoading || showError">
        <v-col class="d-flex align-center justify-center flex-column">
            <v-progress-circular
                v-if="isLoading && !showError"
                indeterminate
                size="82"
                class="ma-auto"
                color="primary"
            ></v-progress-circular>
            <ApiErrorMessage v-if="showError" />
            <NotFound v-if="showNotFound" />
        </v-col>
    </v-row>
</template>

<script lang="ts">
import ApiErrorMessage from "./ApiErrorMessage.vue";

export default {
    name: "LoadingOverlay",
    components: {
        ApiErrorMessage,
        NotFound: () => import("@/views/NotFound.vue"),
    },
    props: {
        isLoading: {
            type: Boolean,
            default: true,
        },
        showError: {
            type: Boolean,
            default: false,
        },
        showNotFound: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style></style>
