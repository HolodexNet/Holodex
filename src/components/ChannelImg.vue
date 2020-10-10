<template>
    <img
        :src="channel.photo"
        crossorigin="anonymous"
        loading="lazy"
        :alt="`${channel.name}'s profile picture`"
        :width="size"
        :height="size"
    />
</template>

<script>
import { channel_photo_resize } from "@/utils/functions";
export default {
    name: "ChannelImg",
    props: {
        channel: {
            type: Object,
            required: true,
        },
        size: {
            type: [String, Number],
            default: 40,
        },
    },
    computed: {
        photo() {
            return channel_photo_resize(this.src, this.size);
        },
    },
};
</script>

<style></style>
