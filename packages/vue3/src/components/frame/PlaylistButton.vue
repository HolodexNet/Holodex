<template>
  <div
    class="i-material-symbols:playlist-play-rounded"
    :class="{
      'opacity-50':
        currentPlaylistQuery.isError.value || !currentPlaylistQuery.data,
    }"
  ></div>
</template>
<script setup lang="ts">
// i mean this just bootstrapping the default use playlist and hooking it up with Pinia.

import { usePlaylist } from "@/services/playlist";
import { usePlaylistState, useCurrentPlaylist } from "@/stores/playlist";

const current = storeToRefs(usePlaylistState());
const cache = useCurrentPlaylist();

const currentPlaylistQuery = usePlaylist(current.currentPlaylistId, {
  onSettled(data, err) {
    console.log("reset currently active playlist:", data);
    cache.active = {
      id: data?.id,
      name: data?.name || "",
      videos: data?.videos || [],
      user_id: data?.user_id || "-1",
      _videoIdSet: data?._videoIdSet || new Set(),
    };
  },
});

if (currentPlaylistQuery.data.value)
  cache.active = currentPlaylistQuery.data.value;

watchEffect(() => {
  if (currentPlaylistQuery.data.value) {
    cache.active = currentPlaylistQuery.data.value;
  }
});
</script>
