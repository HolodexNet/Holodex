<template>
  <!-- Render with opaque response for cache if size is lte 40 -->
  <a :href="!noLink && `/channel/${channel.id}`" v-on="!noLink && { 'click.exact.stop.prevent': goToChannel }">
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
      @error="err=true"
    />
  </a>
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
    data() {
        return { err: false };
    },
    computed: {
        photo() {
            if (this.err) {
                const nearest = Math.min(Math.max(Math.ceil(this.size / 50) * 50, 50), 150);
                return `/statics/channelImg/${this.channel.id}/${nearest}.png`;
            }
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
