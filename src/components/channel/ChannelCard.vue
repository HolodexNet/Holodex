<template>
    <v-card class="rounded-sm" tile :to="`/channel/${channel.id}`">
        <v-list-item v-if="channel" :key="channel.id" :to="`/channel/${channel.id}`" style="padding: 0 16px" three-line>
            <v-list-item-avatar size="100" tile>
                <ChannelImg :channel="channel" size="100" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" includeVideoCount>
                <ChannelSocials :channel="channel" class="pa-0 justify-start" />
            </ChannelInfo>
        </v-list-item>
        <!-- <v-list-item three-line>
            <v-list-item-avatar tile size="100">
                <ChannelImg :channel="channel" :size="100" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" includeVideoCount includeSocials class="channel-info-card" />
        </v-list-item> -->
    </v-card>
</template>

<script lang="ts">
import ChannelImg from "./ChannelImg.vue";
import ChannelInfo from "./ChannelInfo.vue";
import ChannelSocials from "./ChannelSocials.vue";

export default {
    name: "ChannelCard",
    components: {
        ChannelImg,
        ChannelInfo,
        ChannelSocials,
    },
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

<style>
.channel-info-card > .v-list-item__subtitle > .channel-social-horizontal {
    padding: 0 !important;
}
</style>
