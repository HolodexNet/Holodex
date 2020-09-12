<template>
    <v-chip pill :to="`/channel/${channel.id}`">
        <v-avatar left>
            <ChannelImg :src="channel.photo" :size="32" />
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
    },
};
</script>

<style></style>
