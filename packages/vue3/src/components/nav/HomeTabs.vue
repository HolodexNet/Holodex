<template>
  <div
    class="sticky z-10 px-4 overflow-x-auto overflow-y-hidden tabs top-14 flex-nowrap no-scrollbar sm:mb-4 mb-4"
    style="
      background-color: rgb(var(--v-theme-surface));
      box-shadow: inset 0px -2px hsl(var(--bc) / 0.2);
    "
  >
    <div class="flex w-full" :class="{}" style="">
      <a
        class="shrink tab sm:tab-lg tab-bordered border-transparent"
        :class="{ 'tab-active text-secondary !border-secondary': tab === 0 }"
        style="text-overflow: ''; white-space: nowrap; overflow: hidden"
        @click="() => $emit('update:tab', 0)"
      >
        {{ liveUpcomingHeaderSplit[1] }}
        <span
          v-if="counts.liveCnt"
          class="mx-1 rounded-sm badge badge-secondary badge-sm sm:badge-md"
        >
          {{ counts.liveCnt }}
        </span>
        {{ liveUpcomingHeaderSplit[2] }}
        <span
          v-if="counts.upcomingCnt"
          class="mx-1 rounded-sm badge badge-outline badge-sm sm:badge-md"
        >
          {{ counts.upcomingCnt }}
        </span>
      </a>
      <a
        class="tab sm:tab-lg tab-bordered border-transparent"
        :class="{ 'tab-active text-secondary !border-secondary': tab === 1 }"
        @click="() => $emit('update:tab', 1)"
      >
        {{ $t("views.home.recentVideoToggles.official") }}
      </a>
      <a
        class="tab sm:tab-lg tab-bordered border-transparent"
        :class="{ 'tab-active text-secondary !border-secondary': tab === 2 }"
        @click="() => $emit('update:tab', 2)"
      >
        {{ $t("views.home.recentVideoToggles.subber") }}
      </a>

      <div v-if="!display.mobile.value" class="mt-auto ml-auto">
        <slot name="filters"></slot>
      </div>
    </div>
  </div>
  <div v-if="display.mobile.value" class="flex justify-end my-2">
    <slot name="filters"></slot>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
const { t } = useI18n();

const props = defineProps<{
  tab: number;
  counts: { liveCnt: number; upcomingCnt: number };
}>();

const display = useDisplay();

const liveUpcomingHeaderSplit = computed(() => {
  return [
    ...(t("views.home.liveOrUpcomingHeading").match(/(.+)([\\/／・].+)/) || []),
  ];
});

defineEmits(["update:tab"]);
</script>
<style></style>
