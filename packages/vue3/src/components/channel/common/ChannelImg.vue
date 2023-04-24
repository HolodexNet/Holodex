<template>
  <!-- Render with opaque response for cache if size is lte 40 -->
  <router-link
    :href="(!noLink && `/channel/${channel.id}`) || undefined"
    :title="
      channel.name +
      (channel.english_name ? `\nEN: ${channel.english_name}` : '') +
      (channel.org ? `\n> ${channel.org}` : '') +
      (channel.group ? `\n> ${channel.group}` : '')
    "
    data-ctx="channel"
    :data-obj="channel.id"
    :to="!noLink ? `/channel/${channel.id}` : ''"
  >
    <img
      v-if="!err"
      :src="photo"
      crossorigin="anonymous"
      loading="lazy"
      :class="{ 'rounded-full': rounded, 'rounded-md': !rounded }"
      :style="{ width: `${size}px`, height: `${size}px` }"
      @error="err = true"
    />
    <div
      v-else
      :style="{ width: `${size}px` }"
      class="bg-secondary-300"
      :class="{ 'rounded-full': rounded, 'rounded-md': !rounded }"
    >
      <div class="i-mdi:person" :style="{ 'font-size': `${size}px` }" />
    </div>
  </router-link>
</template>

<script lang="ts">
import { getChannelPhoto } from "@/utils/functions";

export default defineComponent({
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
    return {
      err: false,
    };
  },
  computed: {
    photo() {
      return getChannelPhoto(this.channel.id, this.size);
    },
  },
  watch: {
    channel() {
      this.err = false;
    },
  },
  methods: {},
});
</script>

<style scoped>
img:hover {
  cursor: pointer;
}
</style>
