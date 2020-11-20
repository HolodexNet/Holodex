<template>
    <v-chip pill :to="`/channel/${channel.id}`" :close="close">
        <v-avatar left>
            <ChannelImg :channel="channel" />
        </v-avatar>
        {{ channelName }}
    </v-chip>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";

export default {
    name: "ChannelChip",
    components: {
        ChannelImg,
    },
    props: {
        channel: {
            type: Object,
            required: true,
        },
        close: {
            type: Boolean,
            required: false,
        },
    },
    computed: {
        channelName() {
            const prop = this.$store.state.nameProperty;
            if (this.channel[prop]) return this.channel[prop];
            return this.channel.name;
        },
    },
};
</script>

<style></style>
