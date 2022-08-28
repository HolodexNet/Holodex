<template>
  <v-navigation-drawer
    :model-value="modelValue"
    app
    width="220"
    clipped
    class="nav-scroll"
    :temporary="temporary"
    :scrim="false"
    style="
      padding-top: env(safe-area-inset-top);
      padding-left: calc(env(safe-area-inset-left) / 1.3);
    "
    @update:model-value="(bool) => $emit('update:modelValue', bool)"
  >
    <slot />
    <ul class="gap-1 p-2 menu">
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
            <v-list-item-icon
              v-if="page.name === 'Musicdex'"
              style="max-width: 24px"
              :icon="icons.mdiStarFourPointsOutline"
            >
            </v-list-item-icon>
            <div
              v-else-if="page.icon.startsWith('i')"
              :class="page.icon"
              class="v-icon notranslate v-theme--dark v-icon--size-default v-list-item-icon"
            ></div>
            <v-list-item-icon v-else :icon="page.icon"></v-list-item-icon>
            <v-list-item-title>{{ page.name }}</v-list-item-title>
            <!-- Quick Settings Popup -->
            <template v-if="page.path === '/settings' && display">
              <v-menu
                v-model="showSettings"
                :right="false"
                :nudge-right="-50"
                max-height="80vh"
                :close-on-content-click="false"
              >
                <template #activator="{ props }">
                  <v-icon v-bind="props" @click.stop.prevent="() => {}">
                    {{ mdiTuneVariant }}
                  </v-icon>
                </template>
                <v-card rounded="lg" class="py-n2 scrollable">
                  <settings slim @close="showSettings = false" />
                </v-card>
              </v-menu>
            </template>
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
            <v-list-item-icon :icon="page.icon"> </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ page.name }}</v-list-item-title>
            </v-list-item-content>
          </router-link>
        </li>
      </template>
      <!-- </v-list> -->
    </ul>
    <v-divider />
    <div class="justify-center d-flex">
      <v-btn small block elevation="0" @click="expanded = !expanded">
        <v-icon>{{ expanded ? mdiChevronUp : mdiChevronDown }}</v-icon>
      </v-btn>
    </div>

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
import {
  mdiTuneVariant,
  mdiPatreon,
  mdiChevronUp,
  mdiChevronDown,
} from "@mdi/js";
import { useLangStore } from "@/stores";
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

    watch(
      () => props.temporary,
      () => {
        if (props.temporary) ctx.emit("update:modelValue", false);
      }
    );

    return { lang, display, isMobile };
  },
  data() {
    return {
      favoritesExpanded: false,
      showSettings: false,
      expanded: false,

      mdiTuneVariant,
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

.outlined {
  position: relative;
  box-shadow: 0 0 0 2px red, 0 0 4px 3px rgba(255, 0, 0, 0.56);
}
.ch-live {
  /* font-size: large; */
  color: red;
}
.ch-upcoming {
  font-size: small;
  line-height: 24px;
}

.nav-scroll > .v-navigation-drawer__content:hover {
  padding-right: 0px;
  overflow-y: auto !important; /* firefox fallback */
  overflow-y: overlay !important;
}

/* overflow-y: overlay does not work on temporary drawer */
.nav-scroll.v-navigation-drawer--temporary > .v-navigation-drawer__content {
  overflow-y: auto !important;
}

.nav-scroll > .v-navigation-drawer__content {
  overflow-y: hidden !important;
  background-color: var(--v-background-lighten1);
  padding-right: 8px;
}
</style>
