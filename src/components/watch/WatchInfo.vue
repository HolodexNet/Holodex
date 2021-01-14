<template>
    <v-card class="watch-card rounded-0">
        <!-- <div class="video-actions justify-space-between d-flex align-center px-4 pt-2"> -->
        <slot name="actions"></slot>
        <!-- </div> -->
        <v-card-title class="pt-2" style="font-size: 1.125rem; font-weight: 400">{{ video.title }}</v-card-title>
        <v-card-subtitle>
            {{ formattedTime }}<template v-if="video.status === 'live'"> • {{ liveViewers }} viewers></template>
            <!-- <v-icon>{{ icons.mdiRefresh }}</v-icon> -->
        </v-card-subtitle>
        <v-divider />
        <v-list two-line>
            <v-list-item>
                <v-list-item-avatar size="50">
                    <ChannelImg :channel="video.channel" />
                </v-list-item-avatar>
                <ChannelInfo :channel="video.channel" />
                <ChannelSocials :channel="video.channel" />
            </v-list-item>
        </v-list>
        <!-- <v-card-text class="py-2">
            <ChannelChip
                v-for="channel in channel_chips"
                :channel="channel"
                :key="channel.id"
                class="ma-1"
            ></ChannelChip>
            <v-chip
                v-for="tag in video.tags.filter((t) => !t.channel_ref)"
                label
                link
                :key="tag.id"
                style="margin-right: 5px"
                :to="`/search?tags=${tag.name}`"
            >
                {{ `#${tag.name} (${tag.count})` }}
            </v-chip>
        </v-card-text> -->
        <v-card-text class="text-body-2">
            <truncated-text :html="video.description" lines="3" />
        </v-card-text>
        <v-divider />
        <v-list
            style="max-height: 400px"
            dense
            class="pa-0 transparent overflow-y-auto caption"
            v-if="fetchComments && comments"
        >
            <v-divider class="mx-4" style="flex-basis: 100%; height: 0"></v-divider>
            <!-- Render Channel Avatar if necessary -->
            <v-list-item class="pa-0" v-for="comment in comments" :key="comment.comment_key">
                <comment :comment="comment" :videoId="video.id"></comment>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
import ChannelChip from "@/components/channel/ChannelChip";
import ChannelInfo from "@/components/channel/ChannelInfo";
import ChannelSocials from "@/components/channel/ChannelSocials";
import ChannelImg from "@/components/channel/ChannelImg";
// import VideoDescription from "@/components/video/VideoDescription";
import { getVideoThumbnails } from "@/utils/functions";
import { formatDuration, formatStreamStart, dayjs } from "@/utils/time";
import * as icons from "@/utils/icons";
import api from "@/utils/backend-api";
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
        Comment: () => import("@/components/video/Comment"),
    },
    props: {
        video: {
            required: true,
        },
        fetchComments: {
            type: Boolean,
            required: false,
        },
    },
    data() {
        return {
            comments: [],
            timer: null,
            elapsedTime: 0,
            icons,
        };
    },
    methods: {
        formatDuration,
        formatStreamStart,
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
        if (this.fetchComments) {
            api.comments(this.video.id).then((res) => {
                this.comments = res.data;
            });
        }
        this.setTimer();
    },
    watch: {
        // eslint-disable-next-line func-names
        "video.status": function () {
            this.setTimer();
        },
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    computed: {
        channel_chips() {
            // const allMentions = new Map();
            // // Get channel mentions for this video, and add any channel mentions from the source
            // // (in case the uploader forgot to link everyone)
            // this.video.channel_mentions
            //     .filter((channel) => channel.id !== this.video.channel_id)
            //     .forEach((channel) =>
            //         allMentions.set(channel.id, {
            //             id: channel.id,
            //             name: channel.name,
            //             name_en: channel.english_name,
            //             photo: channel.photo,
            //         }),
            //     );
            // return Array.from(allMentions.values());
            return [];
        },
        thumbnail_src() {
            return getVideoThumbnails(this.video.id).medium;
        },
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    return `Starts ${this.formatStreamStart(this.video.start_scheduled)}`;
                case "live":
                    return `Streaming for ${this.elapsedTime}`;
                default:
                    return dayjs(this.video.available_at).format("MMM DD, YYYY");
            }
        },
        liveViewers() {
            return (+this.video.live_viewers).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
    },
};
</script>

<style></style>
