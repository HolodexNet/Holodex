<template>
  <!-- <v-container class="channel-container" fluid> -->
  <sub-navigation :routes="tabs" base-route="/settings">
    <!-- <template #hotlinks><div /></template> -->
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
    if (!display.mobile.value && route.path === "/settings") {
      router.replace("/settings/lang");
    }

    return { display };
  },
  computed: {
    tabs(): { path: string; name: string; class: string; active?: boolean }[] {
      return [
        {
          path: `/settings/lang`,
          active: this.display.sm.value
            ? this.$route.path === "/settings/lang"
            : this.$route.path === "/settings" ||
              this.$route.path === "/settings/lang",
          name: "Language",
          class: this.icons.about,
        },
        {
          path: `/settings/themes`,
          name: "Color Themes",
          class: this.icons.changelog,
        },
        {
          path: `/settings/user`,
          name: "User & Account",
          class: "i-wpf:faq",
        },
        {
          path: `/settings/homepage`,
          name: "Homepage & Filters",
          class: "i-carbon:request-quote",
        },
        {
          path: `/settings/blocked`,
          name: "Blocked Channels",
          class: "i-carbon:event-schedule",
        },
        // advanced (?
      ];
    },
  },
  methods: {},
});
</script>
