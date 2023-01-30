<template>
  <div :class="{ 'text-red-400': video.status === 'live' }">
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
    const { t } = useI18n();
    const { now, pause, resume } = useNow({ interval: 1000, controls: true });
    const shouldTick = computed(
      () => props.video.start_actual && props.video.status === "live"
    );
    watchEffect(() => {
      shouldTick.value ? resume() : pause();
    });

    const startActual = computed(
      () => dayjs(props.video.start_actual).unix() * 1000
    );
    const formatted = computed(() => {
      if (props.video.start_actual && props.video.status === "live") {
        return formatDuration(+now.value - startActual.value);
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

<style lang="postcss"></style>
