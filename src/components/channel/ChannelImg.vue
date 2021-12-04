<template>
  <!-- Render with opaque response for cache if size is lte 40 -->
  <a :href="!noLink && `/channel/${channel.id}`" @click.exact.prevent="goToChannel">
    <v-lazy
      tag="img"
      :src="photo"
      crossorigin="anonymous"
      loading="lazy"
      :alt="!noAlt && `${channel.name}'s profile picture`"
      :width="size"
      :height="size"
      class="d-block"
      :class="rounded && 'rounded-circle'"
    />
  </a>
</template>

<script lang="ts">
import { getChannelPhoto } from "@/utils/functions";

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
        noLink: {
            type: Boolean,
            default: false,
        },
        noAlt: {
            type: Boolean,
            default: false,
        },
        rounded: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        photo() {
            return getChannelPhoto(this.channel.id, this.size);
        },
    },
    methods: {
        goToChannel(e) {
            if (this.noLink) return;
            e.stopImmediatePropagation();
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
