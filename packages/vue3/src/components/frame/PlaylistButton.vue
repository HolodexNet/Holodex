<template>
  <div class="btn-ghost btn-square btn text-2xl">
    <div
      :class="{
        [icons.playlist]: true,
        'opacity-50':
          currentPlaylistQuery.isError.value || !currentPlaylistQuery.data,
      }"
    />
  </div>
</template>
<script setup lang="ts">
// i mean this just bootstrapping the default use playlist and hooking it up with Pinia.

import { usePlaylist } from "@/services/playlist";
import { usePlaylistState } from "@/stores/playlist";

const current = storeToRefs(usePlaylistState());

const currentPlaylistQuery = usePlaylist(current.currentPlaylistId);
</script>
