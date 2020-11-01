<template>
    <v-row style="min-height: 50%" v-if="isLoading || showError">
        <v-col class="d-flex align-center justify-center flex-column">
            <v-progress-circular
                indeterminate
                size="32"
                v-if="isLoading"
            ></v-progress-circular>
            <ApiErrorMessage v-if="showError" />
        </v-col>
    </v-row>
</template>

<script>
import ApiErrorMessage from "@/components/ApiErrorMessage";
export default {
    name: "LoadingOverlay",
    components: {
        ApiErrorMessage,
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
    },
};
</script>

<style></style>
