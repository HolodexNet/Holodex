<template>
  <span :class="'text-' + video.status" :title="absoluteTimeString">
    {{ formattedTime }}
  </span>
</template>

<script lang="ts">
import { useLangStore } from "@/stores";
import { dayjs, formatDistance, localizedDayjs } from "@/utils/time";
import { useNow } from "@vueuse/core";
import { PropType } from 'vue';
import { useI18n } from "vue-i18n";

export default defineComponent({
    props: {
        video: {
            type: Object as PropType<Video>,
            required: true,
        },
    },
    setup(props) {
        const now = useNow({ interval: 1000 })
        const {t} = useI18n();
        const langStore = useLangStore();

        const formattedTime = computed(() => {
            switch (props.video.status) {
                case "upcoming":
                    // print relative time in hours if less than 24 hours,
                    // print full date if greater than 24 hours
                    return formatDistance(
                        props.video.start_scheduled || props.video.available_at,
                        langStore.lang,
                        t.bind(this),
                        false, // allowNegative = false
                        dayjs(now.value),
                    ); // upcoming videos don't get to be ("5 minutes ago")
                case "live":
                    return t("component.videoCard.liveNow");
                default:
                    return formatDistance(
                        props.video.available_at,
                        langStore.lang,
                        t.bind(this),
                    );
            }
        });

        const absoluteTimeString = computed(() => {
            const ts = localizedDayjs(props.video.available_at, langStore.lang);

            const ts1 = ts.format(`${ts.isTomorrow() ? "ddd " : ""}LT zzz`);
            const ts2 = ts
                .tz("Asia/Tokyo")
                .format(`${ts.isTomorrow() ? "ddd " : ""}LT zzz`);
            if (ts1 === ts2) {
                return ts1;
            }
            return `${ts1}\n${ts2}`;
        })

        return {formattedTime, absoluteTimeString}
    }
})


</script>

<style scoped lang="scss">
.text-live {
    color: red;
    font-weight: 500;
}
</style>