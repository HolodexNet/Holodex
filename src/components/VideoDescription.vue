<template>
    <v-expansion-panels flat>
        <v-expansion-panel :value="0">
            <v-expansion-panel-header :expand-icon="mdiMenuDown">
                {{ $t("component.videoDescription.description") }}
            </v-expansion-panel-header>
            <v-expansion-panel-content style="white-space: pre-warp">
                <v-card flat>
                    <v-card-text style="white-space: pre-wrap" class="text-body-2 pa-0">
                        <div v-html="description" v-linkified />
                    </v-card-text>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
import { mdiMenuDown } from "@mdi/js";

export default {
    name: "VideoDescription",
    props: {
        description: {
            required: true,
            type: String,
        },
    },
    data() {
        return {
            mdiMenuDown,
        };
    },
};
</script>

<style></style>
