<template>
    <v-card>
        <v-card-title>{{ $t("views.multiview.presetEditor.title") }}</v-card-title>
        <v-card-subtitle class="pb-0">{{ $t("component.channelInfo.videoCount", [videoCells]) }}</v-card-subtitle>
        <v-card-text>
            <v-row>
                <v-col cols="auto">
                    <LayoutPreview :layout="layout" :content="content" />
                </v-col>
                <v-col style="min-width: 150px">
                    <v-text-field
                        v-model="name"
                        outlined
                        :label="$t('views.multiview.presetEditor.name')"
                        hide-details="auto"
                    />
                    <v-checkbox v-model="autoLayout" :label="$t('views.multiview.presetEditor.autoLayout')" />
                </v-col>
                <v-col cols="12">
                    <v-btn color="success" elevation="5" width="100%" :disabled="!canSave" @click="addPresetLayout()">
                        <v-icon>{{ mdiContentSave }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { mdiContentSave } from "@mdi/js";
import { encodeLayout } from "@/utils/mv-utils";
import { mapState } from "vuex";
import LayoutPreview from "./LayoutPreview.vue";

export default {
    name: "PresetEditor",
    components: {
        LayoutPreview,
    },
    props: {
        layout: {
            type: Array,
            required: true,
        },
        content: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            mdiContentSave,
            name: "",
            autoLayout: false,
        };
    },
    computed: {
        ...mapState("multiview", ["presetLayout"]),
        canSave() {
            return (
                this.name.length > 0 &&
                !this.presetLayout.find((layout) => layout.name === this.name) &&
                this.layout.length
            );
        },
        videoCells() {
            return this.layout.filter((l) => !this.content[l.i] || this.content[l.i].type !== "chat").length;
        },
    },
    methods: {
        addPresetLayout() {
            const content = {
                layout: encodeLayout({
                    layout: this.layout,
                    contents: this.content,
                }),
                name: this.name,
            };
            this.$gtag.event("created-preset", {
                event_category: "multiview",
                event_label: `v${this.videoCells}c${
                    this.layout.filter((l) => this.content[l.i]?.type === "chat").length
                }`,
            });
            this.$store.commit("multiview/addPresetLayout", content);
            if (this.autoLayout) {
                this.$store.commit("multiview/setAutoLayout", {
                    index: this.videoCells,
                    encodedLayout: content.layout,
                });
            }
            this.$emit("close");
        },
    },
};
</script>

<style></style>
