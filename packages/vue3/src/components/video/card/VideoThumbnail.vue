<template>
  <!-- Video Image with Duration -->
  <div
    class="video-thumbnail relative flex aspect-video flex-shrink-0 rounded-md shadow-md hover:shadow-2xl"
    :class="{
      'placeholder-thumbnail': isPlaceholder && video.status !== 'live',
    }"
  >
    <h-lazy class="w-full">
      <img
        :src="(srcs as any)?.[size] || srcs"
        class="aspect-video w-full rounded-md bg-slate-800 object-cover drop-shadow-md"
      />
    </h-lazy>
    <div
      class="absolute flex h-full w-full flex-col justify-between"
      style="z-index: 1"
    >
      <div class="flex items-start justify-between">
        <!-- Topic Id display -->
        <div
          class="video-overlay-tag rounded-sm text-white"
          :style="{ visibility: video.topic_id ? 'visible' : 'hidden' }"
        >
          {{ video.topic_id }}
        </div>
        <save-to-playlist-btn
          v-if="!isPlaceholder"
          class="video-overlay-action text-xl"
          :video="video"
        />
      </div>

      <div class="flex justify-end text-white">
        <!-- Show music icon if songs exist -->
        <div v-if="video.songcount" class="video-overlay-tag rounded-sm">
          <div class="i-icon-park-outline:music-menu text-lg"></div>
        </div>
        <!-- Show TL chat icon if recently active or has archive tl exist -->
        <div
          v-if="hasTLs"
          class="video-overlay-tag rounded-sm"
          :title="tlIconTitle"
        >
          {{ tlLangInChat ? `${tlLangInChat}&nbsp;` : "" }}
          <div class="font-bold">TL</div>
        </div>
        <!-- Duration/Current live stream time -->
        <video-card-live-duration
          v-if="
            !isPlaceholder && ((video.duration || 0) > 0 || video.start_actual)
          "
          :video="video"
          class="video-overlay-tag rounded-sm"
          :class="{ '!bg-red-800 !bg-opacity-70': video.status === 'live' }"
        />
        <div
          v-else-if="placeholderTag"
          class="video-overlay-tag placeholder-tag"
        >
          <span class="mr-1">
            {{ placeholderTag.text }}
          </span>
          <div :class="placeholderTag.icon" class="text-xl"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useLangStore } from "@/stores/lang";
import { useSiteStore } from "@/stores/site";
import { useTLStore } from "@/stores/tldex";
import { getVideoThumbnails } from "@/utils/functions";
import { mdiBroadcast } from "@mdi/js";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { PLACEHOLDER_TYPES } from "@/utils/consts";
import { useTogglePlaylistVideo } from "@/stores/playlist";
import { reactivePick } from "@vueuse/core";
/* eslint-disable no-unused-vars */

export default defineComponent({
  name: "VideoThumbnail",
  components: {},
  props: {
    video: {
      required: true,
      type: Object as PropType<Video>,
    },
    size: {
      type: String as PropType<keyof ReturnType<typeof getVideoThumbnails>>,
      default: "standard",
    },
  },
  setup(props) {
    const site = useSiteStore();
    const display = useDisplay();
    const isMobile = display.mobile;
    const langStore = useLangStore();
    const { toggleSaved, idSet } = useTogglePlaylistVideo();

    const tldexStore = useTLStore();
    const liveTlLang = reactivePick(tldexStore, "liveTlLang");
    const hasSaved = computed(() => idSet.value?.has(props.video.id));
    const { t } = useI18n();
    return {
      site,
      display,
      isMobile,
      langStore,
      liveTlLang,
      toggleSaved,
      hasSaved,
      t,
    };
  },
  computed: {
    isPlaceholder() {
      return this.video.type === "placeholder";
    },
    lang() {
      return this.langStore.lang;
    },
    srcs() {
      // load different images based on current column size, which correspond to breakpoints
      if (this.isPlaceholder) {
        if (this.video.thumbnail) {
          const enc = btoa(this.video.thumbnail);
          const n = enc.replace("+", "-").replace("/", "_").replace(/=+$/, "");
          return `/statics/thumbnail/default/${n}.jpg`;
        }
        return `/statics/channelImg/${this.video.channel.id}.png`;
      }
      const srcs = getVideoThumbnails(this.video.id, false);
      return srcs;
    },
    placeholderTag() {
      if (this.video.placeholderType === PLACEHOLDER_TYPES.EVENT) {
        return {
          text: this.t("component.videoCard.typeEventPlaceholder"),
          icon: "i-material-symbols:auto-schedule-rounded",
        };
      }
      if (this.video.placeholderType === PLACEHOLDER_TYPES.YT_STREAM) {
        return {
          text: this.t("component.videoCard.typeScheduledYT"),
          icon: "i-material-symbols:youtube-activity",
        };
      }

      if (this.video.placeholderType === PLACEHOLDER_TYPES.EXTERNAL_STREAM) {
        let externalIcon = "i-mdi:broadcast";
        if (this.video.link?.includes("twitch.tv")) {
          externalIcon = "i-mdi:twitch";
        } else if (this.video.link?.includes("twitter.com/i/spaces")) {
          externalIcon = "i-mdi:twitter";
        } else if (this.video.link?.includes("instagram")) {
          externalIcon = "i-mdi:instagram";
        } else if (this.video.link?.includes("nicovideo")) {
          externalIcon = "i-simple-icons:niconico";
        }

        return {
          text: this.t("component.videoCard.typeExternalStream"),
          icon: externalIcon,
        };
      }
      return null;
    },
    hasTLs() {
      return (
        (this.video?.status === "past" &&
          this.video?.live_tl_count?.[this.liveTlLang.liveTlLang]) ||
        this.video?.recent_live_tls?.includes(this.liveTlLang.liveTlLang)
      );
    },
    tlLangInChat() {
      return this.hasTLs && this.video.status === "past"
        ? `${this.video.live_tl_count?.[this.liveTlLang.liveTlLang]}`
        : "";
    },
    tlIconTitle() {
      return this.video.status === "past"
        ? this.$t("component.videoCard.totalTLs")
        : this.$t("component.videoCard.tlPresence");
    },
  },
});
</script>

<style lang="scss">
.video-overlay-tag {
  background-color: rgba(0, 0, 0, 0.8);
  margin: 2px;
  padding: 4px;
  text-align: center;
  font-size: 0.75rem;
  height: 0.75rem;
  font-weight: 500;
  box-sizing: content-box;
  letter-spacing: 0.025em;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;

  &.placeholder-tag {
    font-size: 1rem;
    height: 1rem;
    padding: 5px;
    span {
      font-size: 0.8125rem;
    }
    @apply rounded-sm;
  }
}

.video-thumbnail {
  /* Show placeholder info text on hover */
  .placeholder-tag span {
    display: none;
    transform: translateX(-50px);
  }
  &:hover .placeholder-tag span {
    display: inline;
    transform: translateX(0px);
  }

  /* Thumbnail opacity for placeholder */
  &.placeholder-thumbnail {
    opacity: 0.6;
  }

  &:hover.placeholder-thumbnail {
    opacity: 1;
    transition: ease-in 0.1s;
  }
}

.video-overlay-action {
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2px;
  margin: 2px;
}
</style>
