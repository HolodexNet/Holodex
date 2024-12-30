<template>
  <playlist-card
    v-if="currentPlaylist.data.value"
    :playlist="currentPlaylist.data.value"
    :is-editable="currentPlaylist.data.value.user_id == site.user?.id"
  />
</template>

<script setup lang="ts">
import { useSiteStore } from "@/stores";
import { CURRENT_PLAYLIST_PROVIDE_KEY } from "@/utils/consts";
import { Playlist } from "@/utils/types";
import { UseQueryReturnType } from "@tanstack/vue-query";

const site = useSiteStore();

const currentPlaylist = inject(
  CURRENT_PLAYLIST_PROVIDE_KEY,
) as UseQueryReturnType<Playlist, unknown>;

const PlaylistCard = defineAsyncComponent(
  () => import("@/components/playlist/PlaylistCard.vue"),
);
</script>
