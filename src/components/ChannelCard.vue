<template>
    <v-card class="rounded-sm" tile :to="'channel/' + channel.id">
        <v-list-item three-line>
            <v-list-item-avatar tile size="100" color="grey">
                <img :src="channel.photo" />
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
                    {{ channel.clip_count }} Clips
                </v-list-item-subtitle>
                <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
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
};
</script>

<style></style>
