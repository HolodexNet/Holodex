<template>
    <v-card class="rounded-sm" tile :to="`channel/${channel.id}`">
        <v-list-item three-line>
            <v-list-item-avatar tile size="100">
                <v-img :src="photo" />
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title>
                    <div class="text-truncate">{{ channel.name }}</div>
                    <div class="body-2">{{ channel.name_en }}</div>
                </v-list-item-title>
                <v-list-item-subtitle>
                    {{ channel.subscriber_count / 1000 }}K Subscribers
                    <br />
                    {{ channel.video_count }} Videos •
                    <router-link
                        :to="`channel/${channel.id}/clips`"
                        style="text-decoration: none; color:inherit;"
                    >
                        {{ channel.clip_count }} Clips
                    </router-link>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                    <v-btn
                        icon
                        sm
                        :href="`https://www.youtube.com/channel/${channel.yt_channel_id}`"
                        target="_blank"
                    >
                        <v-icon color="#C4302B">mdi-youtube</v-icon>
                    </v-btn>
                    <v-btn
                        icon
                        sm
                        :href="`https://twitter.com/${channel.twitter_link}`"
                        target="_blank"
                    >
                        <v-icon color="#00ACEE">mdi-twitter</v-icon>
                    </v-btn>
                    <v-btn icon sm>
                        <v-icon color="grey">mdi-heart</v-icon>
                    </v-btn>
                </v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
import { channel_photo_resize } from "@/utils/image-utils";
export default {
    name: "ChannelCard",
    props: {
        channel: {
            required: true,
            type: Object,
        },
        withLink: {
            required: false,
            type: Boolean,
        },
    },
    computed: {
        photo() {
            return channel_photo_resize(this.channel.photo, 100);
        }
    }
};
</script>

<style></style>
