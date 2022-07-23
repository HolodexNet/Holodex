<template>
  <a
    class="flex video-card no-decoration"
    :class="{
      'flex-col': !horizontal,
      'video-card-live': video.status === 'live',
    }"
    :target="redirectMode || hasPlaceholderLink ? '_blank' : ''"
    :href="href"
    rel="noopener"
    @click.exact="onThumbnailClicked"
  >
    <video-thumbnail
      :video="video"
      :style="{ width: horizontal ? '168px' : undefined }"
    />
    <a
      :href="watchLink"
      rel="noopener"
      :class="{
        'w-full': horizontal,
      }"
      @click.exact.stop.prevent="goToVideo()"
    >
      <video-card-text
        :video="video"
        :hide-channel-image="hideChannelImage"
        :hide-channel-name="hideChannelName"
        :disable-default-click="disableDefaultClick"
        :class="{
          'ml-2': horizontal,
        }"
      >
        <template #action></template>
      </video-card-text>
    </a>
  </a>
</template>

<script lang="ts">
import { useSettingsStore } from "@/stores/settings";
import { PropType } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import VideoThumbnail from "./VideoThumbnail.vue";

export default defineComponent({
  name: "VideoCard",
  components: {
    VideoThumbnail,
  },
  props: {
    video: {
      type: Object as PropType<Video>,
      default: null,
    },
    hideChannelName: Boolean,
    hideChannelImage: Boolean,
    horizontal: Boolean,
    // disables all default click behavior. Channel Clicks are also disabled.
    disableDefaultClick: Boolean,
    parentPlaylistId: {
      type: [Number, String],
      default: null,
    },
  },
  emits: ["videoClicked"],
  setup() {
    const settings = useSettingsStore();
    const display = useDisplay();

    const isMobile = display.mobile;
    return {
      settings,
      isMobile,
    };
  },
  data() {
    return {
      placeholderOpen: false,
    };
  },
  computed: {
    data() {
      return this.video;
    },
    isPlaceholder() {
      return this.data.type === "placeholder";
    },
    redirectMode() {
      return this.settings.redirectMode;
    },
    watchLink() {
      if (this.isPlaceholder) return;
      const q = this.parentPlaylistId
        ? `?playlist=${this.parentPlaylistId}`
        : "";
      return `/watch/${this.data.id}${q}`;
    },
    hasPlaceholderLink() {
      return (
        this.isPlaceholder &&
        this.data.placeholderType === "external-stream" &&
        this.data.link
      );
    },
    href() {
      if (this.isPlaceholder) {
        if (this.hasPlaceholderLink) {
          return this.data.link;
        }
        return undefined;
      }
      return this.redirectMode
        ? `https://youtu.be/${this.data.id}`
        : this.watchLink;
    },
  },
  methods: {
    goToVideo() {
      this.$emit("videoClicked", this.data);
      if (this.disableDefaultClick || !this.watchLink) return;
      if (this.isPlaceholder) {
        this.openPlaceholder();
        return;
      }
      // On mobile, clicking on watch links should not increment browser history
      // Back button will always return to the originating video list in one click
      if (this.$route.path.match("^/watch") && this.isMobile) {
        this.$router.replace({ path: this.watchLink });
      } else {
        this.$router.push({ path: this.watchLink });
      }
    },
    onThumbnailClicked(e: { preventDefault: () => void }) {
      if (this.hasPlaceholderLink) return;
      if (
        this.isPlaceholder ||
        !this.redirectMode ||
        this.disableDefaultClick
      ) {
        e.preventDefault();
        this.goToVideo();
      }
    },
    openPlaceholder() {
      this.placeholderOpen = true;
    },
    goToChannel() {
      this.$emit("videoClicked", this.data);
      if (this.disableDefaultClick) return;
      this.$router.push({ path: `/channel/${this.data.channel.id}` });
    },
    goToYoutube() {
      this.$emit("videoClicked", this.data);
      if (this.disableDefaultClick) return;
      const url = `https://www.youtube.com/watch?v=${this.data.id}`;
      window.open(url, "_blank", "noopener");
    },
  },
});
</script>
<style lang="scss">
.video-card .hover-show {
  visibility: hidden;
}
.video-card:hover .hover-show {
  visibility: visible;
}
a:visited .video-card-title {
  /* This is hardcoded cuz @apply doesn't work and variables don't have lighten/darken version */
  color: rgb(90, 138, 185);
}
</style>
