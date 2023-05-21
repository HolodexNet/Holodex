<template>
  <!-- <v-container class="channel-container" fluid> -->
  <div
    class="container mx-auto flex flex-col flex-nowrap items-stretch gap-2 p-2 sm:flex-row"
  >
    <div
      id="about-menu"
      class="rounded-md bg-bgColor"
      :class="{
        'flex-grow': true,
        'max-w-full sm:max-w-[200px] md:max-w-[300px]': isDediAboutPage,
      }"
    >
      <ul class="menu menu-vertical w-full p-2">
        <li
          v-if="!minimizeSidebar && $slots.hotlinks"
          class="mb-2 flex text-lg"
          style="flex-direction: row"
        >
          <slot name="hotlinks" />
        </li>
        <template v-if="!minimizeSidebar">
          <li v-for="tab in tabs" :key="tab.path">
            <router-link
              :to="tab.path"
              class="min-h-12 justify-start"
              :title="tab.name"
              :class="{ active: tab.active }"
            >
              <div
                :class="tab.class"
                class="mx-1 inline-block text-xl md:mr-2"
              />
              <span>{{ tab.name }}</span>
            </router-link>
          </li>
        </template>
        <li v-if="minimizeSidebar">
          <router-link :to="baseRoute" class="min-h-12 w-full" :title="'Back'">
            <div class="i-mdi:arrow-left mx-1 inline-block text-xl md:mr-2" />
            <span>Back</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div
      v-if="!($route.path === baseRoute && display.mobile.value)"
      class="max-w-full flex-shrink flex-grow rounded-md bg-bgColor p-3 sm:w-80"
    >
      <h1 v-if="minimizeSidebar" class="mb-2 text-xl font-semibold">
        {{ tabs.find((x) => x.active)?.name }}
      </h1>
      <router-view />
    </div>
  </div>

  <!-- </v-container> -->
  <!-- <LoadingOverlay v-else :is-loading="isLoading" :show-error="hasError" /> -->
</template>

<script lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";

export default defineComponent({
  name: "NewAbout",
  components: {},
  props: {
    routes: {
      type: Object as PropType<
        { path: string; name: string; class: string; active?: boolean }[]
      >,
      required: true,
    },
    baseRoute: {
      type: String,
      required: true,
    },
  },
  setup() {
    const display = useDisplay();

    return { display };
  },
  computed: {
    tabs(): { path: string; name: string; class: string; active: boolean }[] {
      return this.routes.map((x: any) => {
        x.active = x.active || this.$route.path === x.path;
        return x;
      });
    },
    minimizeSidebar() {
      return (
        this.display.smallerOrEqual("sm").value &&
        this.$route.path !== this.baseRoute
      );
    },
    isDediAboutPage() {
      return this.$route.path !== this.baseRoute;
    },
  },
  methods: {},
});
</script>

<style lang="css"></style>
