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
            type: [String, Number],
            default: 40,
        },
        sizeSm: {
            type: Number,
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
        imageHeight() {
            switch (this.$vuetify.breakpoint.name) {
                case "xs":
                    return "200px";
                case "sm":
                    return "400px";
                case "md":
                    return "600px";
                case "lg":
                    return "800px";
                case "xl":
                    return "1000px";
                default:
                    return "200";
            }
        },
    },
};
</script>

<style></style>
