<template>
  <div>
    {{ formatted }}
  </div>
</template>
<script lang="ts">
import { dayjs, formatDuration } from "@/utils/time";
import { useInterval } from "@vueuse/shared";
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
    const ms = computed(() =>
      props.video.status == "live" || props.video.start_actual ? 1000 : 10000
    );
    const interval = useInterval(ms);

    const { t } = useI18n();

    const startActual = computed(
      () => dayjs(props.video.start_actual).unix() * 1000
    );
    const formatted = computed(() => {
      if (props.video.start_actual && props.video.status === "live") {
        interval.value; // make it dependent on interval in this event..
        return formatDuration(Date.now() - startActual.value);
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
