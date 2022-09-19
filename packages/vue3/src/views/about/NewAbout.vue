<template>
  <!-- <v-container class="channel-container" fluid> -->
  <div
    key="aboutpg"
    class="container flex flex-row flex-wrap items-stretch gap-2 pt-3 mx-auto"
  >
    <div
      id="setting-menu"
      class="rounded-md bg-bgColor"
      :class="{
        'flex-grow': !minimizeSidebar,
        shrink: minimizeSidebar,
        'max-w-[200px] md:max-w-[300px]': $route.path !== '/about',
      }"
      style="flex-basis: auto"
    >
      <ul class="w-full p-2 menu">
        <li v-if="!minimizeSidebar" class="flex flex-row mb-2 text-lg">
          <div class="w-full p-2 pb-1 text-xs font-bold pointer-events-none">
            Quick Links:
          </div>
          <!-- <a class="p-0 bg-transparent btn-square btn-disabled">
            <logo class="w-6 h-6 m-auto"></logo>
          </a> -->
          <!-- <a class="p-0 btn-square" title="Make a Channel Request">
            <div class="m-auto i-carbon:request-quote"></div>
          </a> -->
          <!-- <a class="p-0 btn-square" title="Email dev team">
            <div class="m-auto i-mdi:email-fast"></div>
          </a> -->
          <a
            class="p-0 btn-square"
            title="Follow us on twitter"
            href="https://twitter.com/holodex"
          >
            <div class="m-auto i-carbon:logo-twitter"></div>
          </a>
          <a
            class="p-0 btn-square"
            title="Support us on Ko-Fi"
            href="https://ko-fi.com/holodex"
          >
            <div class="m-auto i-fa6-solid:hand-holding-dollar"></div>
          </a>
        </li>
        <li v-for="tab in tabs" :key="tab.path">
          <router-link
            :to="tab.path"
            class="justify-start min-h-12"
            :title="tab.name"
            :class="{
              ' bg-primary': tab.active,
            }"
          >
            <div
              :class="tab.class"
              class="inline-block mx-1 text-xl md:mr-2"
            ></div>
            <span v-if="!minimizeSidebar">{{ tab.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div
      v-if="!($route.path === '/about' && display.xs.value)"
      class="flex-grow flex-shrink-0 p-3 rounded-md xs:max-w-full w-80 bg-bgColor"
      style="flex-basis: 60%; min-width: 300px"
    >
      <router-view></router-view>
    </div>
  </div>

  <!-- </v-container> -->
  <!-- <LoadingOverlay v-else :is-loading="isLoading" :show-error="hasError" /> -->
</template>

<script lang="ts">
import { useDisplay } from "vuetify/lib/framework.mjs";

export default defineComponent({
  name: "Channel",
  components: {},
  setup() {
    const display = useDisplay();
    return { display };
  },
  computed: {
    tabs(): { path: string; name: string; class: string; active: boolean }[] {
      console.log(
        this.display.xs.value
          ? this.$route.path === "/about/general"
          : this.$route.path === "/about" ||
              this.$route.path === "/about/general"
      );
      return [
        {
          path: `/about/general`,
          active: this.display.xs.value
            ? this.$route.path === "/about/general"
            : this.$route.path === "/about" ||
              this.$route.path === "/about/general",
          name: "About Holodex",
          class: this.icons.about,
        },
        {
          path: `/about/faq`,
          name: "Frequently Asked Questions",
          class: "i-wpf:faq",
        },
        {
          path: `/about/request`,
          name: "Channel Request",
          class: "i-carbon:request-quote",
        },
        {
          path: `/about/placeholder`,
          name: "Add a Placeholder",
          class: "i-carbon:event-schedule",
        },
        {
          path: `/about/contact`,
          name: "Extensions",
          class: "i-fluent:extension-24-regular",
        },
        {
          path: `/about/contact`,
          name: "Contact",
          class: this.icons.collabs,
        },
        {
          path: `/about/privacy`,
          name: "Privacy Policy",
          class: "i-material-symbols:privacy-tip",
        },
      ].map((x: any) => {
        x.active = x.active || this.$route.path === x.path;
        return x;
      });
    },
    minimizeSidebar() {
      return this.display.xs.value && this.$route.path !== "/about";
    },
  },
  methods: {},
});
</script>

<style lang="css"></style>
