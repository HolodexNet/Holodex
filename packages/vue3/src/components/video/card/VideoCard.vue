<template>
  <a
    class="flex video-card no-decoration"
    :class="{
      'flex-col': !horizontal,
      'video-card-live': video.status === 'live',
    }"
    :target="openInNew ? '_blank' : ''"
    :href="watchLink"
    rel="noopener"
    @click="intercept"
  >
    <video-thumbnail
      :video="video"
      :size="size"
      :class="{
        'h-[80px] my-auto': horizontal,
        'saturate-50 opacity-60': !selected && selection.selectionMode,
        'opacity-80 border-8 rounded-xl border-transparent ring-primary ring-2 border-opacity-0 -mb-[7px] transition-all':
          selected && selection.selectionMode,
      }"
      class=""
    />
    <div
      v-if="selection.selectionMode"
      :checked="selected ? 'true' : undefined"
      type="checkbox"
      role="checkbox"
      tabindex="2"
      class="checkbox z-[1] video-checkbox checkbox-lg"
      :class="{ 'checkbox-primary': selected, '': !selected }"
      @change.stop.prevent
    />
    <!-- <a
      :href="watchLink"
      rel="noopener"
      :class="{
        'w-full': horizontal,
      }"
      @click.exact.stop.prevent="goToVideo()"
    > -->
    <video-card-text
      :video="video"
      :hide-channel-image="hideChannelImage"
      :hide-channel-name="hideChannelName"
      :class="{
        'w-full': horizontal,
        'ml-2': horizontal,
      }"
    >
      <template v-if="$slots.default" #action
        ><slot :video="video"></slot
      ></template>
    </video-card-text>
    <!-- </a> -->
  </a>
</template>

<script lang="ts">
import { useVideoSelection } from "@/stores/selection";
import { useSettingsStore } from "@/stores/settings";
import { PropType } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

export default defineComponent({
  name: "VideoCard",
  components: {},
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
      // if supplied, all subsequent clicks will navigate to watch page with this playlist as 'watching'.
      type: [Number, String],
      default: null,
    },
    size: {
      type: String as PropType<
        "default" | "medium" | "standard" | "maxres" | "hq720"
      >,
      default: "standard",
    },
  },
  emits: ["videoClicked"],
  setup(props) {
    const settings = useSettingsStore();
    const display = useDisplay();
    const selection = useVideoSelection();
    const selected = computed({
      get: () => selection.contains(props.video.id),
      set: (s) => {
        if (s) {
          selection.selectedVideos.push(props.video);
        } else {
          const idx = selection.selectedVideos.findIndex(
            ({ id }) => id === props.video.id
          );
          if (idx < 0) return;
          selection.selectedVideos.splice(idx, 1);
        }
      },
    });

    const isMobile = display.mobile;
    return {
      settings,
      isMobile,
      selection,
      selected,
    };
  },
  data() {
    return {
      placeholderOpen: false,
    };
  },
  computed: {
    isPlaceholder() {
      return this.video.type === "placeholder";
    },
    openInNew() {
      return (
        this.settings.redirectMode ||
        (this.video.placeholderType === "external-stream" && this.video.link)
      );
    },
    watchLink() {
      if (
        this.isPlaceholder &&
        this.video.placeholderType === "external-stream" &&
        this.video.link
      )
        return this.video.link;
      else if (this.settings.redirectMode)
        return `https://youtu.be/${this.video.id}`;
      const q = this.parentPlaylistId
        ? `?playlist=${this.parentPlaylistId}`
        : "";
      return `/watch/${this.video.id}${q}`;
    },
  },
  methods: {
    intercept(e: MouseEvent) {
      console.log(e);
      e.stopPropagation(); // always stop propagation.
      if (e.shiftKey || e.ctrlKey) return;
      // ^ ignore shift and control modified clicks.
      e.preventDefault(); // prevent hrefs from firing on regular clicks.
      if (this.selection.selectionMode) {
        this.selected = !this.selected;
        return;
      }
      const tgt = e.target as HTMLElement;
      const nearest = tgt.closest("[data-ctx]");
      if (nearest) {
        const ctx = nearest.getAttribute("data-ctx"); // context.
        const obj = nearest.getAttribute("data-obj"); // channel ID in question
        console.log(ctx, obj);
        if (this.disableDefaultClick) {
          return this.$emit("videoClicked", this.video, ctx, obj);
        }
        switch (ctx) {
          case "channel":
            this.$router.push({ path: `/channel/${this.video.channel.id}` });
            return;
          case "_":
        }
      } else {
        // just a regular click:
        if (this.disableDefaultClick) {
          return this.$emit("videoClicked", this.video, "video", undefined);
        }
        // video click default behavior: go to video.
        if (this.settings.redirectMode) {
          const url = `https://www.youtube.com/watch?v=${this.video.id}`;
          window.open(url, "_blank", "noopener");
        } else if (this.openInNew) {
          window.open(this.watchLink, "_blank", "noopener");
        } else {
          this.$router.push({ path: this.watchLink });
        }
      }
    },
    openPlaceholder() {
      this.placeholderOpen = true;
    },
  },
});
</script>
<style lang="scss">
@media (hover: hover) {
  .video-card .hover-show {
    opacity: 0;
  }
  .video-card .hover-show:focus,
  .video-card .hover-show:active,
  .video-card:hover .hover-show {
    opacity: 1;
  }
}
@media (hover: none) {
  .video-card .hover-show {
    opacity: 0.8;
  }
  .video-card .hover-show:focus {
    opacity: 1;
  }
}
a:visited .video-card-title {
  /* This is hardcoded cuz @apply doesn't work and variables don't have lighten/darken version */
  color: rgb(90, 138, 185);
}

.video-checkbox {
  //transform-origin: top left;
  //margin-bottom: 110px;
  //margin-left: 10px;
  transform: translate(2px, -34px); // eyeballed.
  border-style: solid;
  border-width: 5px !important;
  transition: all 0.2s;
  margin-bottom: -24px;
  --tw-border-opacity: 1 !important;
}
.video-checkbox[checked="true"] {
  transform: translate(11px, -36px); // eyeballed
}
</style>
