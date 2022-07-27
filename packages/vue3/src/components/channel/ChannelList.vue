<template>
  <div>{{ list }}</div>
</template>

<script lang="ts">
import { useChannel } from "@/hooks/common/useChannelService";
import { useChannels } from "@/services/useChannels";
import { PropType } from "vue";
import flatten from "lodash/flatten";

interface QueryType {
  type: string;
  org?: string;
  sort?: string;
  order?: string;
}

export default defineComponent({
  props: {
    channels: {
      type: Array as PropType<FullChannel[]> | undefined,
      default: undefined,
    },
    query: {
      type: Object as PropType<QueryType> | undefined,
      default: undefined,
    },
  },
  setup(props) {
    const respChannels = useChannels(
      computed(() => props.query || {}),
      computed(() => !props.channels)
    );

    const list = computed(() => {
      if (props.channels) return props.channels;
      if (respChannels.data.value)
        return flatten(respChannels.data.value.pages);
      return [];
    });

    return { list };
  },
});
</script>
