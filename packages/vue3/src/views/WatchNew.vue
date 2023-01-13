<template>
  <div v-if="id && video" class="flex">
    <div class="flex flex-1">
      <div class="flex flex-col flex-1 pr-[300px]">
        <watch-channel-bar :video="video" class="border-b border-bgColor-100" />
        <div class="px-4 py-2">
          <video-player
            ref="playerInstance"
            :video="video"
            class="watch-video rounded-xl overflow-hidden"
          ></video-player>
        </div>
        <div class="py-1 px-2">
          <div class="flex items-center">
            <div class="font-bold line-clamp-2">{{ video.title }}</div>
            <div class="flex items-center ml-auto">
              <div class="ml-auto flex">
                <button class="btn btn-circle btn-sm btn-outline">
                  <div class="i-tabler:layout-sidebar text-2xl" />
                </button>
                <button class="btn btn-circle btn-sm btn-outline">
                  <save-to-playlist-btn :video="video" class="text-2xl" />
                </button>
                <button class="btn btn-circle btn-sm btn-outline">
                  <div class="i-mdi:dots-vertical text-2xl" />
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <div v-if="video.topic_id" class="flex items-center text-sm">
              <div class="i-mdi:tag mr-0.5"></div>
              {{ video.topic_id }}
            </div>
            &nbsp;
            <div v-if="video.live_viewers" class="flex items-center text-sm">
              <div class="i-mdi:account text-lg mr-0.5" />
              {{ video.live_viewers }}
            </div>
            &nbsp;
            <div class="i-mdi:clock text-lg mr-0.5" />
            <video-card-live-duration
              :video="video"
              class="bg-transparent text-sm"
            />
          </div>
          <div class="divider m-0.5"></div>
          <h-truncated-text :text="video.description" class="px-2 opacity-90" />
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
import { useVideoById } from "@/services/video";
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
watchEffect(() => console.log(playerInstance.value?.currentTime));
</script>
<style lang="scss">
$nav-bar-height: 56px;

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
