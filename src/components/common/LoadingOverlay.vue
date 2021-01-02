<template>
    <v-row style="min-height: 50%" v-if="isLoading || showError">
        <v-col class="d-flex align-center justify-center flex-column">
            <v-progress-circular indeterminate size="32" v-if="isLoading && !showError"></v-progress-circular>
            <ApiErrorMessage v-if="showError" />
            <NotFound v-if="showNotFound" />
        </v-col>
    </v-row>
</template>

<script>
import ApiErrorMessage from "./ApiErrorMessage";

export default {
    name: "LoadingOverlay",
    components: {
        ApiErrorMessage,
        NotFound: () => import("@/views/NotFound"),
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
