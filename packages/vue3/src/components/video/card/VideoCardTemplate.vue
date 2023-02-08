<template>
  <div role="listitem" class="flex">
    <div v-if="$slots.avatar" class="mx-2 self-center">
      <slot name="avatar"/>
    </div>
    <div class="flex flex-1 flex-col">
      <slot/>
    </div>
    <slot name="action"/>
  </div>
</template>
<script lang="ts" setup></script>
