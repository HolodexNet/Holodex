<template>
  <!-- <v-container class="channel-container" fluid> -->
  <div
    key="aboutpg"
    class="container mx-auto flex flex-col flex-nowrap items-stretch gap-2 p-2 sm:flex-row"
  >
    <div
      id="about-menu"
      class="rounded-md bg-bgColor"
      :class="{
        'flex-grow': !minimizeSidebar,
        'flex-shrink': minimizeSidebar,
        'max-w-full sm:max-w-[200px] md:max-w-[300px]': isDediAboutPage,
      }"
      style="flex-basis: auto"
    >
      <ul
        class="menu w-full p-2"
        :class="{ 'menu-horizontal sm:menu-vertical': isDediAboutPage }"
      >
        <li
          v-if="!minimizeSidebar"
          class="mb-2 flex text-lg"
          style="flex-direction: row"
        >
          <div class="pointer-events-none w-full p-2 pb-1 text-xs font-bold">
            Quick Links:
          </div>
          <a
            class="btn-square p-0"
            title="Follow us on twitter"
            href="https://twitter.com/holodex"
          >
            <div class="i-carbon:logo-twitter m-auto" />
          </a>
          <a
            class="btn-square p-0"
            title="Support us on Ko-Fi"
            href="https://ko-fi.com/holodex"
          >
            <div class="i-cib:ko-fi m-auto" />
          </a>
          <a class="btn-square p-0" title="Issues / Source Code">
            <div class="i-carbon:logo-github m-auto" />
          </a>
        </li>
        <li v-for="tab in tabs" :key="tab.path">
          <router-link
            :to="tab.path"
            class="min-h-12 justify-start"
            :title="tab.name"
            :class="{ active: tab.active }"
          >
            <div :class="tab.class" class="mx-1 inline-block text-xl md:mr-2" />
            <span v-if="!minimizeSidebar">{{ tab.name }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div
      v-if="!($route.path === '/about' && display.sm.value)"
      class="xs:max-w-full flex-shrink flex-grow rounded-md bg-bgColor p-3 sm:w-80"
      :style="
        minimizeSidebar
          ? 'flex-basis:100%'
          : 'flex-basis: 60%; min-width: 300px'
      "
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
  setup() {
    const display = useDisplay();
    const router = useRouter();
    const route = useRoute();

    // if it's not mobile, do a redirect:
    if (!display.mobile.value && route.path === "/about") {
      router.replace("/about/general");
    }

    return { display };
  },
  computed: {
    tabs(): { path: string; name: string; class: string; active: boolean }[] {
      console.log(
        this.display.sm.value
          ? this.$route.path === "/about/general"
          : this.$route.path === "/about" ||
              this.$route.path === "/about/general"
      );
      return [
        {
          path: `/about/general`,
          active: this.display.sm.value
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
          path: `/about/extensions`,
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
      return (
        this.display.smallerOrEqual("md").value && this.$route.path !== "/about"
      );
    },
    isDediAboutPage() {
      return this.$route.path !== "/about";
    },
  },
  methods: {},
});
</script>

<style lang="css"></style>
