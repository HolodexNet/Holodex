<template>
    <v-chip pill :to="`/channel/${channel.id}`" :close="close">
        <v-avatar left>
            <ChannelImg :src="channel.photo" :size="32" close />
        </v-avatar>
        {{ channel.name }}
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
};
</script>

<style></style>
