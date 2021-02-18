<template>
    <v-card class="watch-card rounded-0">
        <!-- <div class="video-actions justify-space-between d-flex align-center px-4 pt-2"> -->
        <slot name="actions"></slot>
        <!-- </div> -->
        <v-card-title class="pt-2" style="font-size: 1.125rem; font-weight: 400">{{ video.title }}</v-card-title>
        <v-card-subtitle>
            {{ formattedTime }} <template v-if="video.status === 'live'"> • {{ liveViewers }} viewers</template>
            <!-- <v-icon>{{ icons.mdiRefresh }}</v-icon> -->
        </v-card-subtitle>
        <v-divider />
        <v-list two-line>
            <v-list-item>
                <v-list-item-avatar size="40">
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>
                <ChannelInfo :channel="video.channel" />
                <ChannelSocials :channel="video.channel" />
            </v-list-item>
        </v-list>
        <v-card-text class="text-body-2">
            <truncated-text :html="video.description" lines="3" />
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
import * as icons from "@/utils/icons";
import VideoTopic from "@/components/video/VideoTopic";
import TruncatedText from "@/components/common/TruncatedText";

export default {
    name: "WatchInfo",
    components: {
        ChannelChip,
        VideoTopic,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
        TruncatedText,
        // VideoDescription,
    },
    props: {
        video: {
            required: true,
        },
    },
    data() {
        return {
            timer: null,
            elapsedTime: 0,
            icons,
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
    },
};
</script>

<style>
.watch-card {
    border: none !important;
    box-shadow: none !important;
}
</style>
