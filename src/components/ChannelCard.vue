<template>
    <v-card class="rounded-sm" tile :to="`/channel/${channel.id}`">
        <v-list-item three-line>
            <v-list-item-avatar tile size="100">
                <ChannelImg :channel="channel" :size="100" />
            </v-list-item-avatar>
            <ChannelInfo
                :channel="channel"
                includeVideoCount
                includeSocials
                class="channel-info-card"
            />
        </v-list-item>
    </v-card>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
export default {
    name: "ChannelCard",
    components: {
        ChannelImg,
        ChannelInfo,
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
