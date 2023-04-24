<template>
  <autocomplete
    ref="autocomplete"
    v-model:search="search"
    :selection="selection"
    :options="options"
    :placeholder="'Pick Channel'"
    class="!rounded border border-solid border-bgColor-50 p-1 outline-base-content focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
    @pop-chip="selection.pop()"
    @pointed="({ n }) => scrollIntoView(n)"
    @select="
      ({ n, item }) => {
        search = '';
        if (multi) selection.push(item);
        else selection = [item];
        $emit('update:modelValue', multi ? selection : item);
      }
    "
    @focus="selection = []"
    @submit="() => {}"
  >
    <template #chips="{ selection: list }">
      <channel-tag
        v-for="s in list"
        :key="`${s.id}_chip`"
        :channel="s"
        class="mr-2 h-8 rounded-md pl-1"
        tile
        closeable
        @close="
          () => {
            selection = selection.filter((x) => x != s);
            $emit('update:modelValue', multi ? selection : undefined);
          }
        "
      />
    </template>
    <template #dropdown="{ active }">
      <div
        v-for="(item, idx) in options"
        :key="item.id + idx"
        class="dropdown-opt flex bg-bgColor px-3 py-2 text-sm"
        :class="{ 'border-primary-200 bg-bgColor-200': idx === active }"
        @click.stop.prevent.capture="
          selection = [item];
          search = '';
          $emit('update:modelValue', { text: undefined, value: item });
        "
      >
        <channel-card :channel="item" variant="list" no-link slim />
      </div>
    </template>
  </autocomplete>
</template>

<script lang="ts">
import { watchDebounced } from "@vueuse/core";
// import api from "@/utils/backend-api";
import backendApi from "@/utils/backend-api";
import { PropType } from "vue";

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: undefined,
    },
    type: {
      type: String as PropType<"vtuber" | "any_channel">,
      default: "vtuber",
    },
    multi: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const search = ref("");
    const options = ref<ShortChannel[]>([]);
    const autocomplete = ref(null);

    const loading = ref(false);

    const selection = ref(
      props.multi
        ? (props.modelValue as any[]) ?? []
        : props.modelValue
        ? [props.modelValue]
        : []
    );

    watchDebounced(
      search,
      async (newValue) => {
        if (newValue.length >= 1) {
          loading.value = true;

          const x = await backendApi.searchV3Autocomplete(
            newValue,
            props.type,
            10
          );

          // column `type` is unavailable here, but it's useless.
          options.value = (x.data.vtuber as ShortChannel[]) || [];
          loading.value = false;
        } else {
          options.value = [];
        }
      },
      { debounce: 200, immediate: false }
    );

    const scrollIntoView = function (n: number) {
      console.log("scroll", n);
      console.log(
        (
          (autocomplete as any).value.$el as unknown as HTMLElement
        )?.getElementsByClassName("dropdown-opt")
      );
      if (n < 0) n = 0;
      const el = ((autocomplete as any).value.$el as unknown as HTMLElement)
        ?.getElementsByClassName("dropdown-opt")
        .item(n);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return {
      search,
      selection,
      autocomplete,
      loading,
      options,
      scrollIntoView,
    };
  },
});
</script>

<style scoped></style>
