<template>
    <v-card tile class="d-flex justify-space-between flex-wrap-reverse flex-sm-nowrap">
        <v-btn icon lg @click="goBack()">
            <v-icon>{{ mdiArrowLeft }}</v-icon>
        </v-btn>
        <span class="watch-chips" v-if="!noChips">
            <video-topic :videoId="video.id" :topic="video.topic_id" showEditIfPossible></video-topic>
            <template v-for="mention in channelChips">
                <ChannelChip :channel="mention" :key="mention.id" />
            </template>
            <a
                @click="showAllMentions = !showAllMentions"
                style="white-space: pre"
                class="text-subtitle-2"
                v-if="mentions.length > 3"
            >
                {{ showAllMentions ? "Hide" : "Show" }} {{ mentions.length - 3 }} more
            </a>
        </span>
        <div class="watch-btn-group ml-auto d-flex">
            <slot name="buttons"></slot>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        lg
                        :href="`https://youtu.be/${video.id}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>{{ mdiOpenInNew }}</v-icon>
                    </v-btn>
                </template>
                <span>Open on Youtube</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        lg
                        @click="toggleSaved"
                        :color="hasSaved ? 'primary' : 'white'"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
                    </v-btn>
                </template>
                <span>Save video to Library</span>
            </v-tooltip>
        </div>
    </v-card>
</template>

<script>
import VideoTopic from "@/components/video/VideoTopic";
import ChannelChip from "@/components/channel/ChannelChip";
import { mdiOpenInNew, mdiArrowLeft } from "@mdi/js";

export default {
    name: "WatchToolbar",
    components: {
        ChannelChip,
        VideoTopic,
    },
    props: {
        video: {
            required: true,
        },
        noChips: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            darkMode: true,
            showAllMentions: false,
            mdiOpenInNew,
            mdiArrowLeft,
        };
    },
    methods: {
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
        goBack() {
            this.$router.go(-1);
        },
    },
    computed: {
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        mentions() {
            return this.video.mentions || [];
        },
        channelChips() {
            return this.mentions.length > 3 && !this.showAllMentions ? this.mentions.slice(0, 3) : this.mentions;
        },
        hasSaved() {
            return this.$store.getters["library/hasSaved"](this.video.id);
        },
    },
};
</script>

<style></style>
