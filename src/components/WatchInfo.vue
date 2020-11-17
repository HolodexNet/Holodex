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
            <ChannelChip
                v-for="channel in channel_chips"
                :channel="channel"
                :key="channel.id"
                class="ma-1"
            ></ChannelChip>
            <v-chip
                v-for="tag in video.tags.filter(t => !t.channel_ref)"
                label
                link
                :key="tag.id"
                style="margin-right: 5px"
                :to="`/search?tags=${tag.name}`"
            >
                {{ `#${tag.name} (${tag.count})` }}
            </v-chip>
        </v-card-text>
        <VideoDescription :description="video.description"></VideoDescription>
        <v-divider />
    </v-card>
</template>

<script>
import ChannelChip from "@/components/ChannelChip";
import ChannelInfo from "@/components/ChannelInfo";
import ChannelSocials from "@/components/ChannelSocials";
import ChannelImg from "@/components/ChannelImg";
import VideoDescription from "@/components/VideoDescription";
import { video_thumbnails } from "@/utils/functions";
import dayjs from "dayjs";

export default {
    name: "WatchInfo",
    components: {
        ChannelChip,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
        VideoDescription,
    },
    props: {
        video: {
            required: true,
        },
    },
    methods: {
        formatTime(t) {
            return dayjs(t).format("MMM DD, YYYY");
        },
    },
    computed: {
        channel_chips() {
            let allMentions = new Map();
            // Get channel mentions for this video, and add any channel mentions from the source
            // (in case the uploader forgot to link everyone)
            this.video.channel_mentions
                .concat(this.video.sources.map(video => video.channel))
                .filter(channel => channel.id != this.video.channel_id)
                .forEach(channel =>
                    allMentions.set(channel.id, {
                        id: channel.id,
                        name: channel.name,
                        name_en: channel.name_en,
                        photo: channel.photo,
                    })
                );
            return Array.from(allMentions.values());
        },
        thumbnail_src() {
            return video_thumbnails(this.video.yt_video_key)["medium"];
        },
        isXs() {
            return this.$vuetify.breakpoint.name === "xs";
        },
    },
};
</script>

<style></style>
