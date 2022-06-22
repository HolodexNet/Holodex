<template>
  <h-list style="min-height: 88px" class="relative">
    <template #avatar>
      <channel-img
        v-if="!hideChannelImage"
        :channel="video.channel"
        :size="40"
        rounded
      />
    </template>
    <div class="flex flex-col flex-1 justify-around box-content my-1">
      <div
        class="line-clamp-2 leading-5 visited:text-purple pr-6"
        :title="title"
      >
        {{ title }}
      </div>
      <div class="d-flex flex-shrink-1">
        <a
          v-if="!hideChannelName"
          class="text-sm text-primary leading-4 hover:opacity-80"
          :title="channelHoverTitle"
          :class="{
            'name-vtuber':
              video.type === 'stream' || video.channel.type === 'vtuber',
          }"
          :href="channelLink"
          @click.stop.prevent="goToChannel"
        >
          {{ preferredChannelName }}
        </a>
      </div>
      <div class="text-sm opacity-80">
        <video-card-status :video="video" />
        <template v-if="video.clips && video.clips.length > 0">
          •
          <span class="text-secondary">
            {{
              t(
                "component.videoCard.clips",
                typeof video.clips === "object"
                  ? video.clips.length
                  : +video.clips
              )
            }}
          </span>
        </template>
        <template v-else-if="video.status === 'live' && video.live_viewers">
          •
          {{
            t(
              "component.videoCard.watching",
              formatCount(video.live_viewers, lang)
            )
          }}
        </template>
      </div>
    </div>
    <template #action>
      <video-card-menu :video="video" btn-class="absolute right-0 hover-show" />
    </template>
  </h-list>
</template>

<script lang="ts">
import { useLangStore } from "@/stores/lang";
import { useSiteStore } from "@/stores/site";
import { formatCount, decodeHTMLEntities } from "@/utils/functions";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify/lib/framework.mjs";

export default defineComponent({
  name: "VideoCard",
  props: {
    video: {
      type: Object as PropType<Video>,
      default: null,
    },
    hideChannelName: Boolean,
    hideChannelImage: Boolean,
  },
  setup() {
    const site = useSiteStore();
    const display = useDisplay();

    const isMobile = display.mobile;

    const langStore = useLangStore();
    const lang = computed(() => langStore.lang);
    const { t } = useI18n();
    return {
      lang,
      site,
      display,
      isMobile,
      langStore,
      t,
    };
  },
  computed: {
    isPlaceholder() {
      return this.video.type === "placeholder";
    },
    preferredChannelName() {
      return this.langStore.preferredLocaleFn(
        this.video.channel.english_name,
        this.video.channel.name
      );
    },
    title() {
      if (this.isPlaceholder) {
        return decodeHTMLEntities(
          this.langStore.preferredLocaleFn(
            this.video.title ?? this.video.jp_name,
            this.video.jp_name ?? this.video.title
          ) || ""
        );
      }
      if (!this.video.title) return "";
      return decodeHTMLEntities(this.video.title);
    },
    videoTitle() {
      return this.title;
    },
    channelHoverTitle() {
      return (
        this.video.channel.name +
        (this.video.channel.english_name
          ? `\nEN: ${this.video.channel.english_name}`
          : "") +
        (this.video.channel.org ? `\n> ${this.video.channel.org}` : "") +
        (this.video.channel.group ? `\n> ${this.video.channel.group}` : "")
      );
    },
    channelName() {
      return this.langStore.preferredLocaleFn(
        this.video.channel.english_name,
        this.video.channel.name
      );
    },
    channelLink() {
      return `/channel/${this.video.channel.id}`;
    },
  },
  methods: {
    formatCount,
    goToChannel() {
      //   TODO: is this behavior really needed? Only prevents users who misclick
      //   this.$emit("videoClicked", this.data);
      //   if (this.disableDefaultClick) return;
      this.$router.push({ path: this.channelLink });
    },
  },
});
</script>
