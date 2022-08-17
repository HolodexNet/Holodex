<template>
  <!-- Video Image with Duration -->
  <div
    class="relative flex flex-shrink-0 w-full shadow-md video-thumbnail hover:shadow-2xl"
    :class="{
      'placeholder-thumbnail': isPlaceholder && video.status !== 'live',
    }"
  >
    <v-img
      :aspect-ratio="16 / 9"
      :src="(srcs as any)?.[size] || srcs"
      cover
      class="rounded-md drop-shadow-md bg-slate-800"
    ></v-img>
    <div
      class="absolute flex flex-col justify-between w-full h-full"
      style="z-index: 1"
    >
      <div class="flex items-start justify-between">
        <!-- Topic Id display -->
        <div
          class="rounded-sm video-overlay-tag text-white"
          :style="{ visibility: video.topic_id ? 'visible' : 'hidden' }"
        >
          {{ video.topic_id }}
        </div>

        <!-- Check box for saved video (👻❌) -->
        <v-icon
          v-if="!isPlaceholder"
          :color="hasSaved ? 'primary' : 'white'"
          class="rounded-sm video-overlay-action"
          :class="{ 'hover-show': !hasSaved }"
          role="img"
          @click.prevent.stop="toggleSaved($event)"
        >
          {{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}
        </v-icon>
      </div>

      <div class="flex justify-end text-white">
        <!-- Show music icon if songs exist -->
        <div v-if="video.songcount" class="rounded-sm video-overlay-tag">
          <v-icon small color="white">{{ icons.mdiMusic }}</v-icon>
        </div>
        <!-- Show TL chat icon if recently active or has archive tl exist -->
        <div
          v-if="hasTLs"
          class="rounded-sm video-overlay-tag"
          :title="tlIconTitle"
        >
          {{ tlLangInChat }}
          <v-icon small color="white">{{ icons.tlChat }}</v-icon>
        </div>
        <!-- Duration/Current live stream time -->
        <video-card-live-duration
          v-if="!isPlaceholder"
          :video="video"
          class="rounded-sm video-overlay-tag"
        />
        <div
          v-else-if="placeholderTag"
          class="video-overlay-tag placeholder-tag"
        >
          <span class="mr-1">
            {{ placeholderTag.text }}
          </span>
          <v-icon color="white" class="rounded-sm">
            {{ placeholderTag.icon }}
          </v-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useLangStore } from "@/stores/lang";
import { usePlaylistStore } from "@/stores/playlist";
import { useSiteStore } from "@/stores/site";
import { useTLStore } from "@/stores/tldex";
import { getVideoThumbnails } from "@/utils/functions";
import {
  mdiBroadcast,
  mdiCalendar,
  mdiTwitch,
  mdiTwitter,
  mdiYoutube,
} from "@mdi/js";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { PLACEHOLDER_TYPES, VIDEO_TYPES } from "@/utils/consts";
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
    const playlistStore = usePlaylistStore();
    const hasSaved = computed(() => playlistStore.contains(props.video.id));
    const tldexStore = useTLStore();
    const liveTlLang = computed(() => tldexStore.liveTlLang);
    const { t } = useI18n();
    return {
      site,
      display,
      isMobile,
      langStore,
      hasSaved,
      liveTlLang,
      playlistStore,
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
          icon: mdiCalendar,
        };
      }
      if (this.video.placeholderType === PLACEHOLDER_TYPES.YT_STREAM) {
        return {
          text: this.t("component.videoCard.typeScheduledYT"),
          icon: mdiYoutube,
        };
      }

      if (this.video.placeholderType === PLACEHOLDER_TYPES.EXTERNAL_STREAM) {
        let externalIcon = mdiBroadcast;
        if (this.video.link?.includes("twitch.tv")) {
          externalIcon = mdiTwitch;
        } else if (this.video.link?.includes("twitter.com/i/spaces")) {
          externalIcon = mdiTwitter;
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
          this.video?.live_tl_count?.[this.liveTlLang]) ||
        this.video?.recent_live_tls?.includes(this.liveTlLang)
      );
    },
    tlLangInChat() {
      return this.hasTLs && this.video.status === "past"
        ? `${this.video.live_tl_count?.[this.liveTlLang]}`
        : "";
    },
    tlIconTitle() {
      return this.video.status === "past"
        ? this.$t("component.videoCard.totalTLs")
        : this.$t("component.videoCard.tlPresence");
    },
  },
  methods: {
    toggleSaved(event: { preventDefault: () => void }) {
      event.preventDefault();
      if (this.video.type === VIDEO_TYPES.PLACEHOLDER) return; // huh.
      this.hasSaved
        ? this.playlistStore.removeVideoByID(this.video.id)
        : this.playlistStore.addVideo(this.video);
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
