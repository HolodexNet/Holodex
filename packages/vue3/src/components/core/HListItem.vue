<template>
  <li>
    <a v-if="!to" v-bind="$attrs"><slot /></a>
    <router-link v-if="to" v-bind="$attrs" :to="to"><slot /></router-link>
  </li>
</template>
<script lang="ts">
/**
 * Falls through attributes to the <a> if :to is not defined
 * otherwise, uses router-link instead.
 */
export default {
  inheritAttrs: false,
};
</script>
<script lang="ts" setup>
import { RouteLocationRaw } from "vue-router";

type RLR = RouteLocationRaw;
defineProps<{
  to?: RLR;
}>();
</script>
