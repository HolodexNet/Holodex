<template>
    <div>
        <div class="video" :class="{ 'video-fluid': fluid }" v-if="!redirectMode">
            <slot name="youtube"></slot>
        </div>
        <div class="thumbnail" v-else>
            <v-img :aspect-ratio="16 / 9" :src="thumbnail_src" />
            <div class="thumbnail-overlay d-flex">
                <div class="text-h4 ma-auto">
                    <a :href="`https://youtu.be/${video.id}`"> Open on Youtube </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getVideoThumbnails } from "@/utils/functions";
import { mdiOpenInNew } from "@mdi/js";
import * as icons from "@/utils/icons";

export default {
    name: "WatchFrame",
    components: {},
    props: {
        video: {
            required: true,
        },
        fluid: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            darkMode: true,
            showAllMentions: false,
            mdiOpenInNew,
            icons,
        };
    },
    methods: {
        toggleSaved() {
            this.hasSaved
                ? this.$store.commit("library/removeSavedVideo", this.video.id)
                : this.$store.commit("library/addSavedVideo", this.video);
        },
    },
    computed: {
        thumbnail_src() {
            return getVideoThumbnails(this.video.id).medium;
        },
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
<style>
.thumbnail {
    position: relative;
}

.thumbnail-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
}

.video {
    position: relative;
    padding-bottom: 56.25%;
    padding-bottom: min(56.25%, calc(100vh - 120px));
    width: 100%;
}

.video.video-fluid {
    padding-bottom: min(56.25%, calc(100vh - 36px));
    /* padding-bottom: min(56.25%, 100vh); */
}
.video > div > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
