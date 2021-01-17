<template>
    <!-- <div class="embedded-video" v-if="!redirectMode && video_src"> -->
    <!-- <iframe :src="video_src" frameborder="0" allowfullscreen></iframe> -->
    <div v-if="!redirectMode && video">
        <div class="video">
            <slot name="youtube"></slot>
            <!-- <div class="watch-overlay text-center">
                <template v-for="message in showMessages">
                    <div class="watch-translation" :key="message.message">
                        <div class="watch-translation-author">
                            <span style="background-color: rgba(0, 0, 0, 0.5)" class="pa-1 text-caption">
                                {{ message.author }}
                            </span>
                        </div>
                        <div class="watch-translation-message">
                            {{ message.message }}
                        </div>
                    </div>
                    <br :key="message.message + 'br'" />
                </template>
            </div> -->
        </div>
    </div>
    <div class="thumbnail" v-else>
        <v-img :aspect-ratio="16 / 9" :src="thumbnail_src" />
        <div class="thumbnail-overlay d-flex">
            <div class="text-h4 ma-auto">
                <a :href="`https://youtu.be/${video.id}`"> Open on Youtube </a>
            </div>
        </div>
    </div>
</template>

<script>
import { getVideoThumbnails } from "@/utils/functions";

export default {
    name: "WatchFrame",
    props: {
        video: {
            required: true,
        },
        // translations: {
        //     required: false,
        //     type: Array,
        // },
        // otherMessages: {
        //     required: false,
        //     type: Array,
        // },
        // currentTime: {},
    },
    data() {
        return {
            sub_offset: 8, // offset by 4 seconds

            // chart: null,
            darkMode: true,
        };
    },
    beforeDestroy() {
        if (this.timer) this.stopSync();
    },
    // created() {
    //     this.updateMessages();
    // },
    methods: {},
    computed: {
        thumbnail_src() {
            return getVideoThumbnails(this.video.id).medium;
        },
        redirectMode() {
            return this.$store.state.settings.redirectMode;
        },
        // translationsWithDuration() {
        //     return this.translations.map((m) => {
        //         m.endTime = m.time_secs + m.message.length / 12 + 1;
        //         return m;
        //     });
        // },
        // showMessages() {
        //     return this.translationsWithDuration.filter(
        //         (m) =>
        //             this.currentTime >= m.time_secs - this.sub_offset &&
        //             this.currentTime <= m.endTime - this.sub_offset,
        //     );
        // },
        // lastMessage() {
        //     return this.translations[this.translations.length - 1];
        // },
    },
};
</script>

<style>
.video {
    position: relative;
}
/* .watch-overlay {
    position: absolute;
    width: 100%;
    bottom: 7%;
    z-index: 10;
}
.watch-translation {
    display: inline-block;
    font-size: 1.85rem;
    line-height: 1;
}
.watch-translation-message {
    white-space: pre-wrap;
    background: rgba(8, 8, 8, 0.75);
    padding: 0.25em !important;
}
.watch-translation-author {
    text-align: start;
} */
.embedded-video {
    position: relative;
    padding-bottom: 56.25%;
}
.embedded-video > iframe {
    position: absolute;
    width: auto;
    height: 100%;
}
</style>
