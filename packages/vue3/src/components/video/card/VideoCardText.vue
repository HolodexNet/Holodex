<template>
  <video-card-template style="min-height: 88px" class="relative">
    <template v-if="!hideChannelImage" #avatar>
      <channel-img :channel="video.channel" :size="40" rounded />
    </template>
    <div class="my-1 box-content flex flex-1 flex-col justify-around text-sm">
      <div
        class="video-card-title line-clamp-2 font-medium leading-5"
        :title="preferredTitle"
        :class="{ 'pr-6': !$slots.action }"
      >
        {{ preferredTitle }}
      </div>
      <div class="flex-shrink-1 flex">
        <h-tooltip v-if="video.mentions?.length" placement="bottom">
          <template #activator>
            <a
              v-if="!hideChannelName"
              class="line-clamp-1 leading-4 hover:opacity-80"
              :class="{
                'text-secondary':
                  video.type === 'stream' || video.channel.type === 'vtuber',
              }"
              :href="channelLink"
              data-ctx="channel"
              :data-obj="video.channel.id"
            >
              {{ preferredChannelName }} {{ `(+${video.mentions?.length})` }}
            </a>
          </template>
          <div
            class="flex flex-col gap-1 rounded-lg bg-bgColor-500 p-3 shadow-md"
          >
            <template
              v-for="mention in video.mentions.slice(0, 10)"
              :key="mention.id"
            >
              <div class="flex items-center">
                <channel-img
                  :channel="mention"
                  :size="32"
                  rounded
                  class="mr-2"
                  data-ctx="channel"
                  :data-obj="mention.id"
                />
                {{
                  langStore.preferredLocaleFn(
                    mention.english_name,
                    mention.name
                  )
                }}
              </div>
            </template>
            <div
              v-if="video.mentions.length > 10"
              class="text-center opacity-80"
            >
              {{ `+${video.mentions.length - 10} more` }}
            </div>
          </div>
        </h-tooltip>
        <a
          v-else-if="!hideChannelName"
          class="line-clamp-1 leading-4 hover:opacity-80"
          :title="channelHoverTitle"
          :class="{
            'text-secondary':
              video.type === 'stream' || video.channel.type === 'vtuber',
          }"
          :href="channelLink"
          data-ctx="channel"
          :data-obj="video.channel.id"
        >
          {{ preferredChannelName }}
        </a>
      </div>
      <div class="leading-4 opacity-80">
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
      <div class="self-center" @click.stop>
        <slot name="action" />
        <video-card-menu
          v-if="!$slots.action"
          :video="video"
          btn-class="absolute right-0 top-0 hover-show"
        />
      </div>
    </template>
  </video-card-template>
</template>

<script lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";
import { useVideoFormat } from "@/hooks/common/useVideoService";
import { useSiteStore } from "@/stores/site";
import { formatCount } from "@/utils/functions";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "VideoCardText",
  props: {
    video: {
      type: Object as PropType<Video>,
      default: null,
    },
    hideChannelName: Boolean,
    hideChannelImage: Boolean,
  },
  setup(props) {
    const site = useSiteStore();
    const display = useDisplay();

    const isMobile = display.mobile;
    const { preferredTitle, preferredChannelName, langStore } = useVideoFormat(
      computed(() => props.video)
    );
    const lang = computed(() => langStore.lang);
    const { t } = useI18n();

    return {
      lang,
      site,
      display,
      isMobile,
      langStore,
      t,
      preferredTitle,
      preferredChannelName,
    };
  },
  computed: {
    isPlaceholder() {
      return this.video.type === "placeholder";
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
    channelLink() {
      return `/channel/${this.video.channel.id}`;
    },
  },
  methods: {
    formatCount,
  },
});
</script>
<style>
.video-card-title {
  word-break: break-word;
}
</style>
