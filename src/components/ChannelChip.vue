<template>
    <v-chip pill :to="`/channel/${channel.id}`">
        <v-avatar left>
            <v-img :src="photo"></v-img>
        </v-avatar>
        {{ channel.name }}
    </v-chip>
</template>

<script>
import { channel_photo_resize } from "@/utils/image-utils";
export default {
    name: "ChannelChip",
    props: {
        channel: {
            type: Object,
            required: true,
        },
    },
    computed: {
        photo() {
            return channel_photo_resize(this.channel.photo, 32);
        },
    },
};
</script>

<style></style>
