<template>
  <div class="text-2xl btn btn-square btn-ghost">
    <div
      class="i-material-symbols:playlist-play-rounded"
      :class="{
        'opacity-50':
          currentPlaylistQuery.isError.value || !currentPlaylistQuery.data,
      }"
    ></div>
  </div>
</template>
<script setup lang="ts">
// i mean this just bootstrapping the default use playlist and hooking it up with Pinia.

import { usePlaylist } from "@/services/playlist";
import { usePlaylistState } from "@/stores/playlist";

const current = storeToRefs(usePlaylistState());

const currentPlaylistQuery = usePlaylist(current.currentPlaylistId);
</script>
