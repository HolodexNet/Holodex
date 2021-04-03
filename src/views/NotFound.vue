<template>
    <v-container style="height: 100%">
        <v-row style="height: 100%">
            <v-col class="d-flex flex-column justify-center align-center">
                <div class="text-h4 text-center">
                    {{ $t("views.notFound.title") }}
                </div>
                <v-btn size="md" color="primary" to="/">
                    {{ $t("views.notFound.back") }}
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
export default {
    name: "NotFound",
};
</script>

<style></style>
