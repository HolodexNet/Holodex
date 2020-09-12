<template>
    <v-img :src="photo"></v-img>
</template>

<script>
import { channel_photo_resize } from "@/utils/image-utils";
export default {
    name: "ChannelImg",
    props: {
        src: {
            type: String,
            required: true,
            default: "",
        },
        size: {
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
