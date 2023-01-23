<template>
  <div class="m-auto flex h-full">
    <div
      v-if="props.query.isError.value"
      class="flex flex-1 flex-col items-center justify-center"
    >
      <h4 class="text-2xl font-medium">
        {{ $t("component.apiError.title") }}
      </h4>
      <code v-if="props.query.error.value" class="text-md my-2">{{
        props.query.error.value.message
      }}</code>
      <div class="my-4 text-center">
        {{ $t("component.apiError.textBeforeTwitter") }}
        (<a
          href="https://twitter.com/holodex"
          rel="noopener noreferrer"
          class="link-primary link"
          >@holodex</a
        >)
        {{ $t("component.apiError.textAfterTwitter") }}
        <a href="https://discord.gg/jctkgHBt4b" class="link-primary link"
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
      v-else-if="props.query.isLoading.value || props.query.isFetching.value"
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

// watchEffect(() => {
//   console.log("hey it changed");
//   console.log(props.query.data.value);
//   console.log(props.query.status.value);
// });
</script>
