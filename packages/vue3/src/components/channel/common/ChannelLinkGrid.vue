<template>
  <div
    class="sm:w-30 col-span-2 row-start-2 w-40 grid-flow-row flex-row justify-end gap-1 self-start justify-self-end rounded sm:row-start-auto md:col-span-1 md:w-40 md:gap-2 md:bg-black md:bg-opacity-30"
  >
    <h-btn
      class="h-8 w-8 hover:text-red-500 md:h-12 md:w-12"
      :href="`https://youtube.com/channel/${channel.id}`"
      target="_blank"
      title="Youtube"
      icon="i-carbon:logo-youtube"
      ghost
    />
    <h-btn
      class="h-8 w-8 hover:text-cyan-500 md:h-12 md:w-12"
      :class="{
        'btn-disabled bg-inherit opacity-20': !channel.twitter,
      }"
      :href="channel.twitter ? `https://twitter.com/${channel.twitter}` : '#'"
      target="_blank"
      title="Twitter"
      icon="i-carbon:logo-twitter"
      ghost
    />
    <h-btn
      class="h-8 w-8 hover:text-cyan-500 md:h-12 md:w-12"
      :class="{
        'btn-disabled bg-inherit opacity-20': !channel.twitch,
      }"
      :href="channel.twitch ? `https://twitch.tv/${channel.twitch}` : '#'"
      target="_blank"
      title="Twitter"
      :icon="icons.twitch"
      ghost
    />
    <h-btn
      class="h-8 w-8 md:h-12 md:w-12"
      ghost
      :title="
        isFav
          ? $t('component.channelSocials.removeFromFavorites')
          : $t('component.channelSocials.addToFavorites')
      "
      :icon="isFav ? 'i-mdi:heart text-red-500' : 'i-mdi:heart-outline'"
      @click="toggleFav"
    />
    <h-btn
      ghost
      class="h-8 w-8 !p-0 md:h-12 md:w-12"
      :title="
        !isBlocked
          ? $t('component.channelSocials.block')
          : $t('component.channelSocials.unblock')
      "
      :icon="
        isBlocked
          ? 'i-material-symbols:block text-red-500'
          : 'i-material-symbols:block'
      "
      @click="blockChannel"
    />
  </div>
</template>

<script lang="ts" setup>
import { ChannelActions } from "@/services/channel";
import { useFavoritesIDSet } from "@/services/favorites";

const props = defineProps<{ channel: FullChannel; actions: ChannelActions }>();
</script>
