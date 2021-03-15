<template>
    <v-card class="watch-card rounded-0">
        <v-btn icon class="float-right mt-2 mr-2" :to="`/edit/video/${video.id}`" id="video-edit-btn">
            <v-icon>{{ icons.mdiPencil }}</v-icon>
        </v-btn>
        <v-card-title class="pt-2" style="font-size: 1.125rem; font-weight: 400">{{ video.title }}</v-card-title>
        <v-card-subtitle>
            {{ formattedTime }}
            <template v-if="video.status === 'live'"> • {{ liveViewers }} viewers</template>
            <span class="mx-1" v-show="video.topic_id">
                • <v-icon small>{{ icons.mdiAnimationPlay }}</v-icon>
                {{ video.topic_id }}
            </span>
            <!-- <v-icon>{{ icons.mdiRefresh }}</v-icon> -->
        </v-card-subtitle>
        <v-divider />
        <div class="d-flex justify-space-between flex-wrap align-center">
            <v-col cols="auto">
                <v-list>
                    <v-list-item>
                        <v-list-item-avatar size="80">
                            <ChannelImg :channel="video.channel" size="80" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="video.channel" class="uploader-data-list"> </ChannelInfo>
                        <ChannelSocials :channel="video.channel" />
                    </v-list-item>
                </v-list>
            </v-col>
            <v-col cols="auto">
                <v-avatar rounded left size="60" v-if="channelChips && channelChips.length > 0">
                    <v-icon size="25" color="grey darken-3">{{ icons.mdiAccountBoxMultiple }}</v-icon>
                    <span class="icon-subtext text--grey text--darken-3">{{ $t("views.watch.mentionIconLabel") }}</span>
                </v-avatar>
                <template v-for="mention in channelChips">
                    <ChannelChip :channel="mention" :key="mention.id" :size="60" />
                </template>
                <a
                    @click="showAllMentions = !showAllMentions"
                    style="white-space: pre"
                    class="text-subtitle-2"
                    v-if="mentions.length > 3"
                >
                    {{ showAllMentions ? "Hide" : "Show" }} {{ mentions.length - 3 }} more
                </a>
            </v-col>
        </div>
        <v-card-text class="text-body-2">
            <truncated-text :html="video.description" lines="4" />
        </v-card-text>
    </v-card>
</template>

<script>
import ChannelChip from "@/components/channel/ChannelChip";
import ChannelInfo from "@/components/channel/ChannelInfo";
import ChannelSocials from "@/components/channel/ChannelSocials";
import ChannelImg from "@/components/channel/ChannelImg";
// import VideoDescription from "@/components/video/VideoDescription";
import { getVideoThumbnails } from "@/utils/functions";
import { formatDuration, formatDistance, dayjs, localizedDayjs } from "@/utils/time";
import TruncatedText from "@/components/common/TruncatedText";
// import VideoSongs from "@/components/media/VideoEditSongs";

export default {
    name: "WatchInfo",
    components: {
        ChannelChip,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
        TruncatedText,
        // VideoSongs,
        // VideoDescription,
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
            timer: null,
            elapsedTime: 0,
            editMode: false,
            showAllMentions: false,
        };
    },
    methods: {
        formatDuration,
        formatDistance,
        setTimer() {
            if (this.timer) clearInterval(this.timer);
            // if(this.video.status === "live" || this.video.status === "upcoming") {
            //     this.timer = setInterval(()=> {
            //         this.formattedTime = this.formatTime();
            //     }, this.video.status === "live" ? 1000 : 1000*60);
            // }
            if (this.video.status === "live") {
                this.timer = setInterval(() => {
                    this.elapsedTime = this.formatDuration(dayjs().diff(dayjs(this.video.start_actual)));
                }, 1000);
            }
        },
    },
    mounted() {
        this.setTimer();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    watch: {
        // eslint-disable-next-line func-names
        "video.status": function () {
            this.setTimer();
        },
    },
    computed: {
        lang() {
            return this.$store.state.settings.lang;
        },
        thumbnail_src() {
            return getVideoThumbnails(this.video.id).medium;
        },
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    return this.formatDistance(this.video.start_scheduled, this.lang, this.$t.bind(this));
                case "live":
                    return this.$t("component.watch.streamingFor", [this.elapsedTime]);
                default:
                    return localizedDayjs(this.video.available_at, this.lang).format("MMM DD, YYYY");
            }
        },
        liveViewers() {
            return (+this.video.live_viewers).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        mentions() {
            return this.video.mentions || [];
        },
        channelChips() {
            return this.mentions.length > 3 && !this.showAllMentions ? this.mentions.slice(0, 3) : this.mentions;
        },
    },
};
</script>

<style>
.watch-card {
    border: none !important;
    box-shadow: none !important;
}
.uploader-data-list {
    flex-basis: auto;
    flex-direction: column;
    align-items: stretch;
    margin-right: 12px;
}
.icon-subtext {
    display: block;
    position: absolute;
    font-size: 9px;
    font-weight: 600;
    color: rgb(138, 138, 138);
    bottom: 6px;
    font-family: Arial, Helvetica, sans-serif;
    font-smooth: never;
    -webkit-font-smoothing: antialiased;
    -webkit-text-size-adjust: none;
}
#video-edit-btn.v-btn--active {
    background-color: red;
    box-shadow: 0px 2px 10px rgba(240, 0, 0, 0.651);
}
</style>
