<template>
  <a
    class="flex video-card no-decoration"
    :class="{
      // 'video-card-horizontal': horizontal,
      'flex-col': !horizontal,
    }"
    :target="redirectMode ? '_blank' : ''"
    :href="href"
    rel="noopener"
    @click.exact="onThumbnailClicked"
  >
    <video-thumbnail :video="video" />
    <a :href="watchLink" rel="noopener" @click.exact.stop.prevent="goToVideo()">
      <video-card-text
        :video="video"
        :hide-channel-image="hideChannelImage"
        :hide-channel-name="hideChannelName"
      />
    </a>
  </a>
</template>

<script lang="ts">
import { useSiteStore } from "@/stores/site";
import { PropType } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import VideoThumbnail from "./VideoThumbnail.vue";
/* eslint-disable no-unused-vars */

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
    horizontal: {
      required: false,
      type: Boolean,
      default: false,
    },
    disableDefaultClick: {
      required: false,
      type: Boolean,
      default: false,
    },
    parentPlaylistId: {
      type: [Number, String],
      default: null,
    },
  },
  emits: ["videoClicked"],
  setup() {
    const site = useSiteStore();
    const display = useDisplay();

    const isMobile = display.mobile;
    return {
      site,
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
      return this.site.settings.redirectMode;
    },
    watchLink() {
      const q = this.parentPlaylistId
        ? `?playlist=${this.parentPlaylistId}`
        : "";
      return `/watch/${this.data.id}${q}`;
    },
    href() {
      if (this.isPlaceholder) return undefined;
      return this.redirectMode
        ? `https://youtu.be/${this.data.id}`
        : this.watchLink;
    },
  },
  methods: {
    goToVideo() {
      this.$emit("videoClicked", this.data);
      if (this.isPlaceholder) {
        this.openPlaceholder();
        return;
      }
      if (this.disableDefaultClick) return;
      // On mobile, clicking on watch links should not increment browser history
      // Back button will always return to the originating video list in one click
      if (this.$route.path.match("^/watch") && this.isMobile) {
        this.$router.replace({ path: this.watchLink });
      } else {
        this.$router.push({ path: this.watchLink });
      }
    },
    onThumbnailClicked(e: { preventDefault: () => void }) {
      if (
        this.isPlaceholder &&
        this.data.placeholderType === "external-stream" &&
        this.data.link
      ) {
        e.preventDefault();
        window.open(this.data.link, "_blank", "noopener");
        return;
      }
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
<style>
.video-card .hover-show {
  visibility: hidden;
}
.video-card:hover .hover-show {
  visibility: visible;
}
</style>
