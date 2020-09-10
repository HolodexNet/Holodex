<template>
    <v-container>
        <v-row>
            <v-col style="white-space: pre-wrap" lg="9">
                <strong>Description</strong>
                <br />
                {{ channel.description }}
            </v-col>
            <v-col lg="3">
                <strong>Stats</strong>
                <v-divider class="my-3" />
                {{ channel.video_count }} Videos
                <v-divider class="my-3" />
                {{ channel.clip_count }} Clips
                <v-divider class="my-3" />
                {{ channel.view_count }} Total Views
                <v-divider class="my-3" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "ChannelAbout",
    props: {
        channel: {
            required: true,
            type: Object,
        },
    },
};
</script>

<style></style>
