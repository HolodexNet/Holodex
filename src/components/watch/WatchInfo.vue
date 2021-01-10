<template>
    <v-card class="watch-card rounded-0">
        <v-card-title>{{ video.title }}</v-card-title>
        <v-card-subtitle>
            {{ formatTime(video.published_at) }}
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
        <v-card-text class="py-2">
            <video-topic :videoId="video.id" :topic="video.topic_id" showEditIfPossible> </video-topic>
            <ChannelChip
                v-for="channel in channel_chips"
                :channel="channel"
                :key="channel.id"
                class="ma-1"
            ></ChannelChip>
            <!-- <v-chip
                v-for="tag in video.tags.filter((t) => !t.channel_ref)"
                label
                link
                :key="tag.id"
                style="margin-right: 5px"
                :to="`/search?tags=${tag.name}`"
            >
                {{ `#${tag.name} (${tag.count})` }}
            </v-chip> -->
        </v-card-text>
        <VideoDescription :description="video.description"></VideoDescription>
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
import VideoDescription from "@/components/video/VideoDescription";
import { getVideoThumbnails } from "@/utils/functions";
import { dayjs } from "@/utils/time";
import api from "@/utils/backend-api";
import VideoTopic from "@/components/video/VideoTopic";

export default {
    name: "WatchInfo",
    components: {
        ChannelChip,
        VideoTopic,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
        VideoDescription,
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
        };
    },
    methods: {
        formatTime(t) {
            return dayjs(t).format("MMM DD, YYYY");
        },
    },
    mounted() {
        if (this.fetchComments) {
            api.comments(this.video.id).then((res) => {
                this.comments = res.data;
            });
        }
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
    },
};
</script>

<style></style>
