<template>
  <channel-list
    :channels="settings.blockedChannels"
    variant="card"
    grouping="org"
    :slim="true"
  >
    <template #default="{ channel }">
      <button
        class="flex flex-col justify-center h-full hover:bg-opacity-50 w-9 hover:bg-red-500"
        :title="$t('component.channelSocials.unblock')"
        @click.prevent.stop="unblock(channel)"
      >
        <div
          class="mx-auto text-3xl text-red-500 i-material-symbols:close"
        ></div>
      </button>
    </template>
  </channel-list>
  <div v-if="(settings.blockedChannels?.length ?? 0) == 0">
    Your blocked channels list is empty.
  </div>
</template>
<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";

const settings = useSettingsStore();

const unblock = (channel: ShortChannel) => {
  settings.blockedChannels = settings.blockedChannels.filter(
    (x) => x.id !== channel.id
  );
};
</script>
<style></style>
