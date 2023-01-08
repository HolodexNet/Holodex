<template>
  <div class="grid gap-4 channel-grid justify-items-stretch">
    <template v-for="(arr, group) in list" :key="group + '.group'">
      <div
        v-if="
          (groupKey === 'org' || groupKey === 'group') &&
          Object.keys(list).length > 1
        "
        class="p-2 font-semibold rounded-md shadow-md col-span-full bg-bgColor"
      >
        {{ arr[0] || "Unnamed Group" }}
      </div>
      <template v-for="(channel, idx) in (arr[1] as any)" :key="channel.id">
        <channel-card
          v-if="idx < 20 && group as number < 2"
          :channel="channel"
          :variant="variant"
          :slim="slim"
          class="shadow-xl bg-bgColor"
        >
          <template v-if="$slots.default" #buttons>
            <slot :channel="channel"></slot>
          </template>
        </channel-card>
        <v-lazy v-else style="height: 116px">
          <channel-card
            :channel="channel"
            :variant="variant"
            :slim="slim"
            class="shadow-xl bg-bgColor"
          >
            <template v-if="$slots.default" #buttons>
              <slot :channel="channel"></slot>
            </template>
          </channel-card>
        </v-lazy>
      </template>
    </template>
  </div>
  <query-status v-if="!!query" :query="(resp as any)" />
</template>
<script lang="ts">
import { useChannels } from "@/services/channel";
import { PropType } from "vue";
import flatten from "lodash-es/flatten";
import groupBy from "lodash-es/groupBy";
// import { useInfiniteScroll } from "@vueuse/core";

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
    variant: {
      type: String as PropType<"card" | "list">,
      default: "list",
    },
    grouping: {
      type: String as PropType<"org" | "group" | string>,
      default: "none",
    },
    slim: Boolean,
  },
  setup(props) {
    const respChannels = useChannels(
      computed(() => props.query || {}),
      computed(() => props.channels === undefined)
    );

    const groupKey = computed(() => {
      return props.grouping === "org" || props.grouping === "group"
        ? props.grouping
        : "none";
    });

    const list = computed(() => {
      if (props.channels)
        return Object.entries(groupBy(props.channels, groupKey.value));
      if (respChannels.data.value)
        return Object.entries(
          groupBy(flatten(respChannels.data.value.pages), groupKey.value)
        );
      return [["", []]];
    });
    return { list, groupKey, resp: respChannels };
  },
  methods: {
    async intersect() {
      console.log("intersecting", this.resp.hasNextPage?.value);
      if (this.resp?.hasNextPage?.value) {
        await this.resp.fetchNextPage();
      }
    },
  },
});
</script>
<style>
/* 1fr = "fraction unit", which is ratio basis of remaining space.
  https://developer.mozilla.org/en-US/docs/Web/CSS/repeat#auto-fill <- for autofill. 
  autofill: (= largest possible positive integer that does not cause the grid to overflow its grid)

  minmax is basically saying between the left and right, the left being minimum size, which is 30rem,
   or when the screen is really small, 90%vw.
*/

.channel-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(30rem, 90vw), 1fr));
}
</style>
