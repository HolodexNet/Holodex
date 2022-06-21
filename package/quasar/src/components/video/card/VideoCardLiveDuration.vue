<template>
  <div
    v-if="(video.duration || 0) > 0 || video.start_actual"
    :class="{ 'video-duration-live': video.status !== 'live' }"
  >
    {{ formatted }}
  </div>
</template>
<script lang="ts">
import { dayjs, formatDuration } from "@/utils/time";
import { useNow } from "@vueuse/core";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    video: {
      type: Object as PropType<Video>,
      required: true,
    },
  },
  setup(props) {
    const now = useNow({ interval: 1000 });
    const { t } = useI18n();

    const formatted = computed(() => {
      if (props.video.start_actual && props.video.status === "live") {
        return formatDuration(
          dayjs(now.value).diff(dayjs(props.video.start_actual))
        );
      }
      if (props.video.status === "upcoming" && props.video.duration) {
        return t("component.videoCard.premiere");
      }
      return (
        props.video.duration && formatDuration(props.video.duration * 1000)
      );
    });

    return { formatted };
  },
});
</script>

<style lang="postcss">
.video-overlay-tag.video-duration-live {
  @apply bg-red-700;
}
</style>
