<template>
  <channel-list
    :channels="settings.blockedChannels"
    variant="card"
    grouping="org"
    :slim="true"
  >
    <template #default="{ channel }">
      <button
        class="flex flex-col justify-center w-8 h-8 h-full c-social-icon"
        :title="$t('component.channelSocials.unblock')"
        @click="unblock(channel)"
      >
        <div class="text-3xl text-red-500 i-material-symbols:close"></div>
      </button>
    </template>
  </channel-list>
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
