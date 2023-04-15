<template>
  <div v-if="id && video" class="flex">
    <div class="flex flex-1">
      <div class="watch-left flex flex-1 flex-col">
        <!-- <watch-channel-bar :video="video" class="border-b border-bgColor-100" /> -->

        <div class="p-2">
          <video-player
            ref="playerInstance"
            :video="video"
            class="watch-video overflow-hidden rounded-xl"
          />
        </div>

        <div class="px-2 pb-1">
          <!-- <div class="flex items-center"> -->
          <!-- <div class="font-bold line-clamp-2">{{ video.title }}</div> -->
          <div class="flex items-center">
            <div class="flex items-center">
              <div v-if="video.topic_id" class="flex items-center text-sm">
                <div class="i-fluent:tag-multiple-16-regular mr-0.5" />
                {{ video.topic_id }}
                &nbsp;
              </div>

              <div v-if="video.live_viewers" class="flex items-center text-sm">
                <div class="i-mdi:account mr-0.5 text-lg" />
                {{ video.live_viewers }}
                &nbsp;
              </div>
              <div v-if="video.available_at" class="flex items-center text-sm">
                <div class="i-mdi:clock mr-0.5 text-lg" />
                <video-card-live-duration
                  :video="video"
                  class="bg-transparent text-sm"
                  :class="{ 'text-red-400': video.status === 'live' }"
                />
                &nbsp;
              </div>
            </div>
            <div class="ml-auto flex">
              <button class="btn-icon btn-sm btn">
                <div class="i-tabler:layout-sidebar text-2xl" />
              </button>
              <button class="btn-icon btn-sm btn">
                <save-to-playlist-btn :video="video" class="text-2xl" />
              </button>
              <button class="btn-icon btn-sm btn">
                <div class="i-mdi:dots-vertical text-2xl" />
              </button>
            </div>
          </div>
          <div class="flex items-center">
            <channel-img
              :channel="video.channel"
              :size="36"
              rounded
              class="mr-2 flex flex-shrink-0"
            />
            <div>
              <div class="line-clamp-2 font-bold">{{ preferredTitle }}</div>
              <span class="opacity-80">{{ preferredChannelName }}</span>
            </div>
            <button class="btn-icon btn-sm btn ml-auto text-primary">
              <div class="i-mdi:heart text-xl" />
            </button>
            <button class="btn-icon btn-sm btn text-primary">
              <div class="i-mdi:share text-xl" />
            </button>
          </div>
          <div
            v-if="video.mentions"
            class="mt-2 flex flex-wrap items-center gap-y-2"
          >
            <div class="i-mdi:account-group mr-1 text-2xl" />
            <template
              v-for="mention in mentionsShowMore
                ? video.mentions
                : video.mentions?.slice(0, 3)"
            >
              <channel-tag :channel="mention" class="mr-1" />
            </template>
            <a
              v-if="video.mentions.length > 3"
              class="cursor-pointer text-sm text-primary"
              @click="mentionsShowMore = !mentionsShowMore"
            >
              [{{ mentionsShowMore ? "-" : "+"
              }}{{ video.mentions.length - 3 }}]
            </a>
          </div>
          <!-- </div> -->
          <div class="divider m-0.5" />
          <h-truncated-text
            :text="video.description"
            class="px-2 opacity-90"
            :lines="2"
          />
        </div>
      </div>
      <div class="watch-chat">
        <live-chat :video="video" class="h-full" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PlayerRef } from "@/components/player/usePlayer";
import { useVideoFormat } from "@/hooks/common/useVideoService";
import { useVideoById } from "@/services/video";
import { useVideoSelection } from "@/stores/selection";
const route = useRoute();
const playerInstance = ref<PlayerRef | null>(null);
const clipLangRef = computed(() => ({
  // lang: langStore.clipLangsCSV,
  c: "1",
}));
const id = computed(() =>
  route.name === "Watch" ? (route.params.id as string) : ""
);
const { data: video, isLoading } = useVideoById(id, clipLangRef, {
  enabled: computed(() => !!id.value),
});
const { preferredChannelName, preferredTitle } = useVideoFormat(video);

const mentionsShowMore = ref(false);
// watchEffect(() => console.log(playerInstance.value?.currentTime));

// update current page metadata for selection purposes
const selection = useVideoSelection();
selection.context.pageVideo = video.value;
watch(
  () => video.value?.id,
  () => {
    selection.context.pageVideo = video.value;
    selection.context.pageChannel = video.value?.channel;
  }
);

/**
 * @TODO:
 *
 * [ ] Favorite button hookup
 * [ ] Share link hookup
 * [ ] Dropdown menu items.
 * [ ] When this window is too small, it doesn't autoscale the video to fit. Is that desirable? :think:
 * [ ] Top bar should be retractable (if necessary)
 * [ ] Sidebar should be retractable (side bar should always retract?)
 */
</script>
<style lang="scss">
$nav-bar-height: 56px;

.watch-left {
  padding-right: 300px;
}

.watch-video {
  position: relative;
  padding-bottom: 56.25%;
  padding-bottom: min(
    56.25%,
    calc(
      100vh
        /* - #{$nav-bar-height} - #{$controls-height} - #{$title-info-height} */
    )
  );
  width: 100%;
}

.watch-video iframe {
  position: absolute;
}

.watch-chat {
  width: 300px;
  height: calc(100vh - $nav-bar-height);
  position: fixed;
  right: 0;
}
</style>
