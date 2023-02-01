<template>
  <autocomplete
    ref="autocomplete"
    v-model:search="search"
    :selection="selection"
    :options="options"
    :placeholder="'Pick Channel'"
    class="!rounded !border !border-primary"
    @pop-chip="selection.pop()"
    @pointed="({ n }) => scrollIntoView(n)"
    @select="
      ({ n, item }) => {
        search = '';
        selection = [item];
        $emit('update:modelValue', { text: undefined, value: item });
      }
    "
    @focus="selection = []"
    @submit="() => {}"
  >
    <template #chips="{ selection: s }">
      <channel-tag v-if="s && s[0]" :channel="s[0]"></channel-tag>
    </template>
    <template #dropdown="{ active }">
      <div
        v-for="(item, idx) in options"
        :key="item.id + idx"
        class="dropdown-opt flex bg-bgColor py-2 px-3 text-sm"
        :class="{ 'border-primary-200 bg-bgColor-200': idx === active }"
        @click.stop.prevent.capture="
          selection = [item];
          search = '';
          $emit('update:modelValue', { text: undefined, value: item });
        "
      >
        <channel-card
          :channel="item"
          variant="list"
          no-link
          slim
        ></channel-card>
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
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const search = ref("");
    const options = ref<ShortChannel[]>([]);
    const autocomplete = ref(null);

    const loading = ref(false);

    const selection = ref(
      props.modelValue?.value ? [props.modelValue.value] : []
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
