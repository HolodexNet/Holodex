<template>
    <v-container>
        <v-row>
            <v-col sm="12" class="col-12 col-md-3">
                <strong>Stats</strong>
                <v-divider class="my-3" />
                {{ channel.video_count }} Videos
                <v-divider class="my-3" />
                {{ channel.clip_count }} Clips
                <v-divider class="my-3" />
                {{ channel.view_count }} Total Views
                <v-divider class="my-3" />
            </v-col>
            <v-col
                style="white-space: pre-wrap"
                class="col-12 col-md-9"
                order="md-first"
            >
                <strong>Description</strong>
                <br />
                {{ channel.description }}
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
