<template>
  <playlist-card
    v-if="currentPlaylist.data.value"
    :playlist="currentPlaylist.data.value"
    :is-editable="currentPlaylist.data.value.user_id == site.user?.id"
  ></playlist-card>
</template>

<script setup lang="ts">
import { usePlaylist } from "@/services/playlist";
import { useSiteStore } from "@/stores";
import { usePlaylistState, usePlaylistVideoIDCache } from "@/stores/playlist";

const site = useSiteStore();

const current = storeToRefs(usePlaylistState());
const cache = usePlaylistVideoIDCache();

const currentPlaylist = usePlaylist(current.currentPlaylistId);
</script>
