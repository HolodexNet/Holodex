<template>
    <v-container>
        <v-row>
            <v-col sm="12" class="col-12 col-md-3">
                <strong>{{ $t("component.channelInfo.stats") }}</strong>
                <v-divider class="my-3" />
                {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
                <v-divider class="my-3" />
                {{ channel.clip_count }} {{ $t("component.channelInfo.clipCount", [channel.clip_count]) }}
                <v-divider class="my-3" />
                {{ channel.view_count }} {{ $t("component.channelInfo.totalViews") }}
                <v-divider class="my-3" />
            </v-col>
            <v-col style="white-space: pre-wrap" class="col-12 col-md-9" order="md-first">
                <strong>{{ $t("component.videoDescription.description") }}</strong>
                <br />
                <div v-html="channel.description" v-linkified />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
export default {
    name: "ChannelAbout",
    computed: {
        channel() {
            return this.$store.state.channel.channel;
        },
    },
};
</script>

<style></style>
