<template>
    <v-img :src="photo"></v-img>
</template>

<script>
import { channel_photo_resize } from "@/utils/functions";
export default {
    name: "ChannelImg",
    props: {
        src: {
            type: String,
            required: true,
            default: "",
        },
        size: {
            type: [String, Number],
            default: 40,
        },
        sizeSm: {
            type: Number,
            default: 40,
        },
        sizeLg: {
            type: Number,
            default: 40,
        },
        sizeMd: {
            type: Number,
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
