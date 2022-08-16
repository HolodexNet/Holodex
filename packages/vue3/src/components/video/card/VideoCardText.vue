<template>
  <h-list style="min-height: 88px" class="relative">
    <template v-if="!hideChannelImage" #avatar>
      <channel-img :channel="video.channel" :size="40" rounded />
    </template>
    <div class="box-content flex flex-col justify-around flex-1 my-1">
      <div class="pr-6 leading-5 line-clamp-2 video-card-title" :title="title">
        {{ title }}
      </div>
      <div class="flex flex-shrink-1">
        <v-tooltip
          v-if="video.mentions?.length"
          location="bottom"
          :transition="'slide-y-transition'"
        >
          <template #activator="{ props }">
            <a
              v-if="!hideChannelName"
              v-bind="props"
              class="text-sm leading-4 hover:opacity-80 line-clamp-1"
              :class="{
                'text-secondary':
                  video.type === 'stream' || video.channel.type === 'vtuber',
              }"
              :href="channelLink"
              @click.stop.prevent="goToChannel"
            >
              {{ preferredChannelName }} {{ `(+${video.mentions?.length})` }}
            </a>
          </template>
          <div
            class="flex flex-col gap-1 p-3 rounded-lg shadow-md bg-bgColor-500"
          >
            <template v-for="mention in video.mentions" :key="mention.id">
              <div class="flex items-center">
                <channel-img
                  :channel="mention"
                  :size="32"
                  rounded
                  class="mr-2"
                />
                {{
                  langStore.preferredLocaleFn(
                    mention.english_name,
                    mention.name
                  )
                }}
              </div>
            </template>
          </div>
        </v-tooltip>
        <a
          v-else
          class="text-sm leading-4 hover:opacity-80 line-clamp-1"
          :title="channelHoverTitle"
          :class="{
            'text-secondary':
              video.type === 'stream' || video.channel.type === 'vtuber',
          }"
          :href="channelLink"
          @click.stop.prevent="goToChannel"
        >
          {{ preferredChannelName }}
        </a>
      </div>
      <div class="text-sm leading-4 opacity-80">
        <video-card-status :video="video" />
        <template v-if="video.clips && video.clips.length > 0">
          •
          <span class="text-primary">
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
            t("component.videoCard.watching", [
              formatCount(video.live_viewers, lang),
            ])
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
    disableDefaultClick: Boolean,
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
      if (this.disableDefaultClick) return;
      //   TODO: is this behavior really needed? Only prevents users who misclick
      //   this.$emit("videoClicked", this.data);
      //   if (this.disableDefaultClick) return;
      this.$router.push({ path: this.channelLink });
    },
  },
});
</script>
<style>
.video-card-title {
  word-break: break-word;
}
</style>
