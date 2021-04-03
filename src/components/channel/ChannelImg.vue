<template>
    <!-- Render with opaque response for cache if size is lte 40 -->
    <a :href="`/channel/${channel.id}`" @click.stop>
        <v-lazy
            tag="img"
            :src="photo"
            crossorigin="anonymous"
            loading="lazy"
            :alt="`${channel.name}'s profile picture`"
            :width="size"
            :height="size"
            class="d-block"
        />
    </a>
    <!-- otherwise render using vuetify lazy  -->
    <!-- <a :href="`/channel/${channel.id}`">
        <v-img
            :src="photo"
            crossorigin="anonymous"
            :alt="`${channel.name}'s profile picture`"
            :width="size"
            :height="size"
            @click.stop.prevent="goToChannel(channel.id)"
        />
    </a> -->
    <!-- v-else -->
    <!-- :to="`/channel/${channel.id}`" -->
</template>

<script lang="ts">
import { resizeChannelPhoto } from "@/utils/functions";

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
            if (!this.channel.photo) return "";
            return resizeChannelPhoto(this.channel.photo, this.size);
        },
    },
    methods: {
        goToChannel() {
            this.$router.push({ path: `/channel/${this.channel.id}` });
        },
    },
};
</script>

<style scoped>
img:hover {
    cursor: pointer;
}
</style>
