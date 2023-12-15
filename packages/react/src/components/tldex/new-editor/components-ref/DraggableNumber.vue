<template>
  <span
    :class="[horizontal ? 'cursor-col-resize' : 'cursor-row-resize']"
    @mousedown="start"
  >
    {{ rendered }}
    <!-- <div
      class="i-eva:edit-fill inline-block cursor-text"
    /> -->
  </span>
</template>

<script lang="ts" setup>
const modelValue = defineModel<number>({ required: true });
const props = withDefaults(
  defineProps<{
    formatter?: (n: number) => string;
    precision?: number;
    negativeOk?: boolean;
    scale?: number;
    vertical?: boolean;
    horizontal?: boolean;
  }>(),
  {
    formatter: (x: number) => x.toString(),
    precision: 1,
    negativeOk: false,
    scale: 0.1,
    vertical: false,
    horizontal: true,
  }
);
const emit = defineEmits<{ change: [diffSeconds: number] }>();

const dragStartPos = ref<number>();
const dragInProgressValue = ref(modelValue.value);

const rendered = computed(() => {
  return props.formatter(
    dragStartPos.value == undefined
      ? modelValue.value
      : +dragInProgressValue.value.toFixed(props.precision)
  );
});
function start(e: MouseEvent) {
  dragStartPos.value = 0;
  dragInProgressValue.value = modelValue.value;
  (e.target as HTMLElement).requestPointerLock();
  (e.target as HTMLElement).style.cursor = "crosshair";

  const mouseMoveHandler = (moveEvent: MouseEvent) => {
    const movement = props.horizontal
      ? moveEvent.movementX
      : -moveEvent.movementY;
    dragStartPos.value = (dragStartPos.value ?? 0) + movement;
    const newValue = modelValue.value + dragStartPos.value * props.scale;
    console.log(
      modelValue.value,
      "+",
      dragStartPos.value * props.scale,
      "=",
      newValue
    );
    dragInProgressValue.value = props.negativeOk
      ? newValue
      : Math.max(0, newValue);
  };
  const mouseUpHandler = () => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
    const diff = +dragInProgressValue.value.toFixed(props.precision);
    modelValue.value = diff;
    emit("change", diff);
    dragStartPos.value = undefined;
    (e.target as HTMLElement).style.cursor = props.horizontal
      ? "col-resize"
      : "row-resize";
    document.exitPointerLock();
  };

  document.addEventListener("mousemove", mouseMoveHandler);
  document.addEventListener("mouseup", mouseUpHandler);
}
</script>
