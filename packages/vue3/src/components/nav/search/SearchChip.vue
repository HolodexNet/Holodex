<template>
  <div
    class="badge-ghost badge mr-1 cursor-default rounded-sm border-0 bg-bgColor px-1 text-xs font-semibold tracking-tight hover:badge-error"
  >
    <span class="">{{ categoryName }}:</span>
    <span class="ml-1 rounded-lg">{{ categoryValue }}</span>
  </div>
</template>
<script setup lang="ts">
import { useLangStore } from "@/stores";
import { useI18n } from "vue-i18n";

type QueryItem = {
  type: string;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean; // if true, clicking it will replace the prior.
  _raw?: any;
};

const props = defineProps<{ item: QueryItem }>();

const { t } = useI18n();
const langPrefs = useLangStore();

const categoryName = computed(() => {
  return t(`search.class.${props.item.type}`, props.item.type);
});
// const categoryExplanation = computed(() => {
//   return t(`search.class_explanation.${props.item.type}`, " ");
// });
const categoryValue = computed(() => {
  if (props.item.type === "vtuber" && props.item._raw && props.item._raw.name) {
    return langPrefs.preferredLocaleFn(
      props.item._raw.english_name,
      props.item._raw.name
    );
  }
  return props.item.text === "$t"
    ? t(`search.class_values.${props.item.type}.${props.item.value}`, " ")
    : props.item.text === "?"
    ? props.item.value
    : props.item.text;
});
</script>
