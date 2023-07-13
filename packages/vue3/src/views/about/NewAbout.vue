<template>
  <!-- <v-container class="channel-container" fluid> -->
  <sub-navigation :routes="tabs" base-route="/about">
    <!-- <template #hotlinks> -->
    <!-- <span class="pointer-events-none w-full pb-1 !p-1 !text-xs font-bold">
        Quick Links:
      </span>
      <h-btn
        class="btn-square btn-sm !p-0"
        no-color
        ghost
        icon="i-simple-icons:twitter !text-sm"
        tooltip-text="Follow us on twitter"
        tooltip="badge-ghost"
      />

      <h-btn
        class="btn-square btn-sm mx-1 !p-1"
        no-color
        ghost
        icon="i-simple-icons:ko-fi"
        tooltip-text="Support us on Ko-Fi"
        tooltip="badge-ghost"
      />

      <h-btn
        class="btn-square btn-sm !p-0"
        no-color
        ghost
        icon="i-simple-icons:github"
        tooltip-text="Issues / Source Code"
        tooltip="badge-ghost"
      /> -->
    <!-- </template> -->
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
