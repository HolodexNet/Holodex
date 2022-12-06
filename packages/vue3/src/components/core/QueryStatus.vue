<template>
  <div class="flex m-auto h-full">
    <div
      v-if="props.query.isError"
      class="justify-center flex flex-1 flex-col items-center"
    >
      <h4 class="text-2xl font-medium">
        {{ $t("component.apiError.title") }}
      </h4>
      <code v-if="props.query.error.value" class="text-md my-2">{{
        props.query.error.value.message
      }}</code>
      <div class="text-center my-4">
        {{ $t("component.apiError.textBeforeTwitter") }}
        (<a
          href="https://twitter.com/holodex"
          rel="noopener noreferrer"
          class="link link-primary"
          >@holodex</a
        >)
        {{ $t("component.apiError.textAfterTwitter") }}
        <a href="https://discord.gg/jctkgHBt4b" class="link link-primary"
          >Discord</a
        >{{ $t("component.apiError.afterAboutPageHyperlink") }}
        <br />
        Tip: Hard Refresh/Clear Cache: <code>CTRL + SHIFT + R</code>
        <!-- <br v-if="$store.state.userdata.user">
        <v-btn v-if="$store.state.userdata.user" small @click="$store.dispatch('logout')">
          {{ $t("component.mainNav.logout") }}
        </v-btn> -->
      </div>
      <v-btn small href="/">
        <v-icon>{{ icons.mdiRefresh }}</v-icon>
        Retry
      </v-btn>
    </div>
    <v-progress-circular
      v-else-if="props.query.isLoading || props.query.isFetching"
      indeterminate
      color="primary"
      :size="64"
      class="m-auto"
    ></v-progress-circular>
  </div>
</template>
<script setup lang="ts">
import { UseQueryReturnType } from "@tanstack/vue-query";
const props = defineProps<{ query: UseQueryReturnType<any, any> }>();

watch(props.query, () => {
  console.log(props.query);
});
</script>
