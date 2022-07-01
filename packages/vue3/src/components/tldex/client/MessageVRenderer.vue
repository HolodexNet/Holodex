<template>
  <!-- <virtual-list
    ref="tlBody"
    class="archive tl-body px-1 py-0 px-lg-3"
    :style="{
      'font-size': tldex.liveTlFontSize + 'px',
    }"
    :data-component="ChatMessage"
    :data-key="getKey"
    :data-sources="dividedTLs"
    :item-height="20"
    :item-class-add="addClass"
    :keeps="50"
    @click="(e) => $emit('message-click', e)"
  /> -->
  <div ref="container" class="overflow-auto archive tl-body px-1 py-0 px-lg-3">
    <div
      :style="{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }"
    >
      <template
        v-for="virtualItem in rowVirtualizer.getVirtualItems()"
        :key="virtualItem.key"
      >
        <message-renderer
          :ref="virtualItem.measureElement"
          :source="messages"
          :index="virtualItem.index"
          :hide-author="hideAuthor(virtualItem.index)"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualItem.size}px`,
            transform: `translateY(${virtualItem.start}px)`,
          }"
        >
          Row {{ virtualItem.index }}
        </message-renderer>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { useVirtualizer } from "@/hooks/virtualizer/useVirtualizer";
import { PropType } from "vue";
import { Message } from "./chatMixin";

export default defineComponent({
  props: {
    messages: {
      type: Object as PropType<Message[]>,
      required: true,
    },
  },
  emits: ["message-click"],
  setup(props) {
    const container = ref(null);

    const rowVirtualizer = reactive(
      useVirtualizer<any, Message>({
        count: 2000,
        getScrollElement: () => container.value,
        estimateSize: () => 35,
        overscan: 10,
      })
    );

    return { rowVirtualizer };
  },
  methods: {
    hideAuthor(index: number) {
      return !(
        index === 0 ||
        index === this.messages.length - 1 ||
        this.messages[index].name !== this.messages[index - 1].name ||
        !!this.messages[index].breakpoint
      );
    },
  },
});
</script>
