<template>
    <div :ref="source.breakpoint && 'messageBreakpoint'">
        <div
            class="tl-author"
            :class="{
                'primary--text': source.is_owner,
                'secondary--text': source.is_verified || source.is_moderator || source.is_vtuber,
            }"
        >
            <v-divider class="my-1" />
            <span style="cursor: pointer" @click="showBlockChannelDialog = true">
                <v-icon x-small>{{ icons.mdiCog }}</v-icon>
                {{ `${source.prefix} ${source.name}` }}:
            </span>
        </div>
        <div class="tl-message">
            <span class="tl-caption mr-1" v-if="source.timestamp">
                {{ source.displayTime }}
            </span>
            <span class="text--primary" v-html="source.message"></span>
        </div>
        <v-dialog v-model="showBlockChannelDialog" width="500">
            <v-card>
                <v-card-title>{{ source.name }}</v-card-title>
                <v-card-text>
                    <v-btn @click="toggleBlockName(source.name)">
                        {{ !blockedNames.has(source.name) ? "Block Channel" : "Unblock" }}
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: "ChatMessage",
    data() {
        return {
            showBlockChannelDialog: false,
        };
    },
    props: {
        source: {
            type: Object,
            required: true,
        },
        index: {
            type: Number,
        },
    },
    computed: {
        blockedNames() {
            return this.$store.getters["settings/liveTlBlockedNames"];
        },
    },
    methods: {
        toggleBlockName(name) {
            this.$store.commit("settings/toggleLiveTlBlocked", name);
        },
    },
};
</script>

<style></style>
