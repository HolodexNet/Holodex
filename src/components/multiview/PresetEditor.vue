<template>
    <v-card>
        <v-card-title>{{ $t("views.multiview.presetEditor.title") }}</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="auto">
                    <LayoutPreview :layout="layout" :content="content" />
                </v-col>
                <v-col style="min-width: 150px">
                    <v-text-field
                        outlined
                        :label="$t('views.multiview.presetEditor.name')"
                        hide-details="auto"
                        v-model="name"
                    />
                    <v-checkbox :label="$t('views.multiview.presetEditor.autoLayout')" v-model="autoLayout" />
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
import { encodeLayout, getEmptyCells } from "@/utils/mv-layout";
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
            return this.name.length > 0 && !this.presetLayout.find((layout) => layout.name === this.name);
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
                emptyCells: this.autoLayout
                    ? getEmptyCells({
                        layout: this.layout,
                        content: this.content,
                    })
                    : 0,
            };
            this.$store.commit("multiview/addPresetLayout", content);
            this.$emit("close");
        },
    },
};
</script>

<style></style>
