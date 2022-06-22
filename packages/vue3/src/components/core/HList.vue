<template>
  <div role="listitem" class="flex">
    <div class="self-center mx-2"><slot name="avatar"></slot></div>
    <div class="flex flex-col flex-1">
      <slot></slot>
    </div>
    <slot name="action" class="flex"></slot>
  </div>
</template>
<script lang="ts" setup></script>
