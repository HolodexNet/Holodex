<template>
  <div
    class="btn-grid max-w-xs"
    :class="{ 'flex flex-row flex-nowrap gap-1': flat }"
  >
    <div
      class="flex flex-row flex-nowrap gap-1"
      :class="{ 'mb-1 w-full': !flat }"
    >
      <h-btn
        class="btn-primary grow"
        style="min-width: 5rem"
        :class="actions.isFav.value ? 'btn-active' : ''"
        no-color
        tooltip="badge-primary"
        :title="
          actions.isFav.value
            ? $t('component.channelSocials.removeFromFavorites')
            : $t('component.channelSocials.addToFavorites')
        "
        :icon="
          actions.isFav.value
            ? 'i-material-symbols:heart-check-rounded text-primary-content'
            : 'i-material-symbols:heart-plus-outline'
        "
        @click="actions.toggleFav(channel)"
      />
      <h-btn
        ghost
        class="!px-1"
        tooltip
        tooltip-placement="top-end"
        :title="
          !actions.isBlocked.value
            ? $t('component.channelSocials.block')
            : $t('component.channelSocials.unblock')
        "
        :icon="
          actions.isBlocked.value
            ? 'i-material-symbols:visibility-off text-red-500'
            : 'i-material-symbols:block'
        "
        @click="
          actions.isBlocked.value
            ? actions.unblock(channel)
            : actions.block(channel)
        "
      />
    </div>
    <div class="flex gap-1" :class="{ 'w-full': !flat }">
      <h-btn
        class="hover:text-red-500"
        :href="`https://youtube.com/channel/${channel.id}`"
        target="_blank"
        title="Youtube"
        icon="i-carbon:logo-youtube"
        ghost
      />
      <h-btn
        class="hover:text-cyan-500"
        :class="{
          'btn-disabled': !channel.twitter,
        }"
        :href="channel.twitter ? `https://twitter.com/${channel.twitter}` : '#'"
        target="_blank"
        title="Twitter"
        icon="i-carbon:logo-twitter"
        ghost
      />
      <h-btn
        class="hover:text-cyan-500"
        :class="{
          'btn-disabled': !channel.twitch,
        }"
        :href="channel.twitch ? `https://twitch.tv/${channel.twitch}` : '#'"
        target="_blank"
        title="Twitter"
        :icon="icons.twitch"
        ghost
      />
      <!-- <h-icon class="i-mdi:menu-down w-1 p-0" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChannelActions } from "@/services/channel";

const props = defineProps<{
  channel: FullChannel;
  actions: ChannelActions;
  flat?: boolean;
}>();
</script>
<style>
.btn-grid {
}

.btn-grid .btn {
  @apply border border-primary-50 border-opacity-20 text-xs normal-case;
}
.btn-grid .btn:hover {
  @apply border-opacity-50;
}
.btn-grid .btn.btn-disabled {
  @apply border-opacity-10 bg-inherit opacity-90;
}
</style>
