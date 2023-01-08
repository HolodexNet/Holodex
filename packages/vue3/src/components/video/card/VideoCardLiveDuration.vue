<template>
  <div
    v-if="(video.duration || 0) > 0 || video.start_actual"
    :class="{ '!bg-red-800 !bg-opacity-70': video.status === 'live' }"
  >
    {{ formatted }}
  </div>
</template>
<script lang="ts">
import { useSharedNow } from "@/hooks/temporal/useGlobalNow";
import { dayjs, formatDuration } from "@/utils/time";
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
    const now = useSharedNow({ interval: 1000 });
    // if (props.video.status !== "live") pause();
    // watch(
    //   () => props.video.status,
    //   () => {
    //     props.video.status !== "live" ? pause() : resume();
    //   }
    // );
    const { t } = useI18n();

    const startActual = computed(
      () => dayjs(props.video.start_actual).unix() * 1000
    );
    const formatted = computed(() => {
      if (props.video.start_actual && props.video.status === "live") {
        return formatDuration(now.value.valueOf() - startActual.value);
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
