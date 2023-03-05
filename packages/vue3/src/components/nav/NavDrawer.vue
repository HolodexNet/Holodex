<template>
  <div
    class="h-full border-r border-bgColor-100 bg-bgColor"
    style="
      padding-top: env(safe-area-inset-top);
      padding-left: calc(env(safe-area-inset-left) / 1.3);
    "
  >
    <ul class="menu gap-0 sm:gap-1" :class="!isMobile && 'p-2'">
      <!-- {{
        modelValue
      }} -->
      <!-- <v-list> -->
      <template
        v-for="page in (pages.filter((e) => !e.extra) as any[])"
        :key="page.name"
      >
        <li>
          <component
            :is="linkComponent(page)"
            :active-class="'active'"
            :class="{
              active:
                $route.fullPath === page.path ||
                ($route.name && $route.name === page.routeName),
            }"
            :to="page.path"
            :href="page.path"
            @click="(e: MouseEvent) => handlePageClick(page, e)"
          >
            <div
              v-if="page.icon.startsWith('i')"
              :class="page.icon"
              class="ml-1 h-6 w-6"
            />
            <div>{{ page.name }}</div>
          </component>
        </li>
        <h-divider v-if="page.divider" :key="`${page.path}-divider`" />
      </template>

      <!-- Expanded part -->
      <h-divider v-if="expanded" />

      <template v-if="expanded">
        <li v-for="page in pages.filter((e) => e.extra)" :key="page.name">
          <component
            :is="linkComponent(page)"
            :to="page.path"
            :href="page.path"
            :class="{ active: $route.fullPath === page.path }"
            @click="(e: MouseEvent) => handlePageClick(page, e)"
          >
            <div>
              <span>{{ page.name }}</span>
            </div>
          </component>
        </li>
      </template>
      <!-- </v-list> -->
      <h-divider />

      <slot />
      <li v-if="isMobile && !site.user" class="text-gray-400">
        <router-link :to="'/login'">
          <div class="i-ion:md-log-in ml-1 h-6 w-6" />
          Login
        </router-link>
      </li>
      <h-btn
        class="!h-6 w-full"
        text
        :icon="expanded ? 'i-mdi:chevron-up' : 'i-mdi:chevron-down'"
        @click="expanded = !expanded"
      />
    </ul>

    <sidebar-favorites />

    <div id="bottom-bar">
      <a
        href="https://twitter.com/holodex"
        title="Twitter"
        :class="icons.twitter + ' text-sm'"
        style="color: #1da1f2"
      />
      <a
        title="Support holodex (Ko-fi)"
        href="https://ko-fi.com/holodex"
        class="i-simple-icons:kofi text-sm"
        style="color: #ff5e5b"
      />
      <span class="tracking-tight">©2020 Holodex</span>
      |
      <router-link to="/settings" class="line-clamp-1 hover:bg-slate-500">
        {{ language }}
      </router-link>
    </div>

    <!-- </v-list> -->
  </div>
</template>

<script lang="ts">
import { useLangStore, useSiteStore } from "@/stores";
import { langs } from "@/hooks/i18n/i18nConsts";
import { PropType } from "vue";
import { useDisplay } from "@/hooks/common/useDisplay";

type Page = {
  name: string;
  path: string;
  icon?: any;
  collapsible?: boolean;
  extra?: boolean;
  isAbsolute?: boolean;
};

export default defineComponent({
  name: "NavDrawer",
  components: {},
  props: {
    pages: {
      required: true,
      type: Array as PropType<Page[]>,
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
    linkComponent({ isAbsolute }: { isAbsolute?: boolean }) {
      return isAbsolute ? "a" : "router-link";
    },
    // getChannelLiveAtTime,
  },
});
</script>

<style>
#bottom-bar {
  position: fixed;
  bottom: 0;
  width: var(--sidebar-width-px);
  @apply z-50 flex flex-row items-stretch justify-center gap-1 bg-bgColor-100 text-xs;
}
</style>
