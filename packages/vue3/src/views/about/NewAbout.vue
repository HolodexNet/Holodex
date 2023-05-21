<template>
  <!-- <v-container class="channel-container" fluid> -->
  <sub-navigation :routes="tabs" base-route="/about">
    <template #hotlinks>
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
    </template>
  </sub-navigation>
</template>

<script lang="ts">
import { useDisplay } from "@/hooks/common/useDisplay";

export default defineComponent({
  name: "NewAbout",
  components: {},
  props: {},
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
    tabs(): { path: string; name: string; class: string; active?: boolean }[] {
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
          path: `/about/changelog`,
          name: "Changelog",
          class: this.icons.changelog,
        },
        {
          path: `/about/faq`,
          name: "F.A.Q",
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
      ];
    },
  },
  methods: {},
});
</script>

<style lang="css"></style>
