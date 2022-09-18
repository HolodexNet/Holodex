<template>
  <v-navigation-drawer
    :model-value="modelValue"
    width="220"
    class="nav-scroll"
    :temporary="temporary"
    :scrim="false"
    style="
      padding-top: env(safe-area-inset-top);
      padding-left: calc(env(safe-area-inset-left) / 1.3);
    "
    @update:model-value="(bool) => $emit('update:modelValue', bool)"
  >
    <ul class="gap-0 sm:gap-1 menu" :class="!isMobile && 'p-2'">
      <!-- {{
        modelValue
      }} -->
      <!-- <v-list> -->
      <template
        v-for="page in (pages.filter((e) => !e.extra) as any[])"
        :key="page.name"
      >
        <li>
          <router-link
            :class="{
              active:
                $route.fullPath === page.path ||
                ($route.name && $route.name === page.routeName),
            }"
            :to="page.path"
            @click="(e) => handlePageClick(page, e)"
          >
            <div
              v-if="page.icon.startsWith('i')"
              :class="page.icon"
              class="v-icon notranslate v-theme--dark v-icon--size-default v-list-item-icon"
            ></div>
            <v-list-item-icon v-else :icon="page.icon"></v-list-item-icon>
            <v-list-item-title>{{ page.name }}</v-list-item-title>
          </router-link>
        </li>
        <v-divider v-if="page.divider" :key="`${page.path}-divider`" />
      </template>

      <!-- Expanded part -->
      <v-divider v-if="expanded" />

      <template v-if="expanded">
        <li v-for="page in pages.filter((e) => e.extra)" :key="page.name">
          <router-link
            :to="page.path"
            :class="{ 'v-list-item--active': $route.fullPath === page.path }"
            @click="(e) => handlePageClick(page, e)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ page.name }}</v-list-item-title>
            </v-list-item-content>
          </router-link>
        </li>
      </template>
      <!-- </v-list> -->
      <v-divider />
      <div class="h-6">
        <v-btn class="!h-6" block elevation="0" @click="expanded = !expanded">
          <v-icon>{{ expanded ? mdiChevronUp : mdiChevronDown }}</v-icon>
        </v-btn>
      </div>
      <slot />
      <li
        v-if="display.mobile"
        class="py-0 text-xs font-semibold text-gray-400"
      >
        <template v-if="!site.user">
          <router-link :to="'/login'">
            <div
              class="v-icon notranslate v-theme--dark v-icon--size-default v-list-item-icon i-ion:md-log-in"
            ></div>
            Login</router-link
          >
        </template>
        <template v-else-if="site.user">
          <router-link
            :to="'/settings/user'"
            style="padding-top: 3px; padding-bottom: 3px"
          >
            <div class="-mr-1 i-tabler:user"></div>
            {{ site.user.username }} :
            {{ site.user.contribution_count }}pts</router-link
          >
        </template>
      </li>
    </ul>

    <sidebar-favorites></sidebar-favorites>

    <div
      id="bottom-bar"
      class="z-50 flex flex-row justify-center gap-1 text-xs text-gray-400"
    >
      <a
        href="https://twitter.com/holodex"
        title="Twitter"
        :class="icons.twitter + ' text-sm'"
        style="color: #1da1f2"
      >
      </a>
      <a
        title="Support holodex (Ko-fi)"
        href="https://ko-fi.com/holodex"
        class="text-sm i-simple-icons:kofi"
        style="color: #ff5e5b"
      >
      </a>
      <span class="tracking-tight"> ©2020 Holodex </span>
      |
      <router-link to="/settings" class="line-clamp-1 hover:bg-slate-500">
        {{ language }}
      </router-link>
    </div>

    <!-- </v-list> -->
  </v-navigation-drawer>
</template>

<script lang="ts">
import { mdiPatreon, mdiChevronUp, mdiChevronDown } from "@mdi/js";
import { useLangStore, useSiteStore } from "@/stores";
import { useDisplay } from "vuetify";
import { langs } from "@/hooks/i18n/i18nConsts";

export default defineComponent({
  name: "NavDrawer",
  components: {},
  props: {
    pages: {
      required: true,
      type: Array,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    temporary: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const lang = useLangStore();
    const display = useDisplay();

    const isMobile = display.mobile;
    const site = useSiteStore();

    watch(
      () => props.temporary,
      () => {
        if (props.temporary) ctx.emit("update:modelValue", false);
      }
    );

    return { lang, display, isMobile, site };
  },
  data() {
    return {
      favoritesExpanded: false,
      showSettings: false,
      expanded: false,
      mdiPatreon,
      mdiChevronDown,
      mdiChevronUp,
    };
  },
  computed: {
    // ...mapState("favorites", ["favorites", "live"]),
    language() {
      return langs.find((x) => x.val === this.lang.lang)?.display || "???";
    },
  },
  methods: {
    handlePageClick(page: any, event: Event) {
      // reload the page if user clicks on the same tab
      if (page.path.startsWith("https://")) return;
      event.preventDefault();
      page.path === this.$route.path && !this.$route.query.page
        ? this.refresh()
        : this.$router.push({ path: page.path });
    },
    async refresh() {
      // here to fetch the data and rerender the contents.
      // check if there's a handler on the sequence
      // do default refresh if none
      this.$router.go(0);
    },
    // getChannelLiveAtTime,
  },
});
</script>

<style>
#bottom-bar {
  position: absolute;
  width: 100%;
  bottom: 0;
  background-color: hsl(var(--b3));
  border-top: 1px solid hsl(var(--b1));
}

.nav-scroll > .v-navigation-drawer__content:hover {
  overflow-y: auto !important; /* firefox fallback */
  overflow-y: overlay !important;
}

/* overflow-y: overlay does not work on temporary drawer */
.nav-scroll.v-navigation-drawer--temporary > .v-navigation-drawer__content {
  overflow-y: auto !important;
}

.nav-scroll > .v-navigation-drawer__content {
  overflow-y: hidden !important;
  padding-right: 0px;
}
</style>
