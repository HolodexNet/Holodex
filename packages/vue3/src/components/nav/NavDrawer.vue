<template>
  <v-navigation-drawer
    :value="value"
    app
    width="220"
    clipped
    class="nav-scroll"
    :temporary="temporary"
    style="
      padding-top: env(safe-area-inset-top);
      padding-left: calc(env(safe-area-inset-left) / 1.3);
    "
    @input="$emit('input', $event)"
  >
    <slot />
    <ul class="gap-1 p-2 menu">
      <!-- <v-list> -->
      <template v-for="page in pages.filter((e) => !e.extra)" :key="page.name">
        <li>
          <router-link
            :to="page.path"
            :class="{ 'v-list-item--active': $route.fullPath === page.path }"
            @click="(e) => handlePageClick(page, e)"
          >
            <v-list-item-icon
              v-if="page.name === 'Musicdex'"
              style="max-width: 24px"
              :icon="icons.mdiStarFourPointsOutline"
            >
            </v-list-item-icon>
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
                <template #activator="{ on, attrs }">
                  <v-icon v-bind="attrs" v-on="on" @click.stop.prevent>
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

    <div
      id="bottom-bar"
      class="flex flex-row justify-center gap-1 text-xs text-gray-400"
    >
      <a href="https://twitter.com/holodex" title="Twitter">
        <v-icon size="small" color="#1DA1F2">{{ icons.mdiTwitter }}</v-icon>
      </a>
      <a title="Support holodex (Ko-fi)" href="https://ko-fi.com/holodex">
        <v-icon size="small" color="#FF5E5B"
          >M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604
          0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672
          2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734
          4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011
          3.976-4.011
          3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01
          3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832
          3.011.723
          4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551
          1.971 2.638c0 1.913-.985 2.667-2.059 3.015z</v-icon
        >
      </a>
      <span> © 2020 Holodex </span>

      <i
        ><v-icon size="x-small" color="grey">
          {{ icons.mdiEarth }}
        </v-icon></i
      >
      <router-link to="/settings" class="one-liner">
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
    value: {
      type: Boolean,
      default: false,
    },
    temporary: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["input"],
  setup() {
    const lang = useLangStore();
    const display = useDisplay();

    const isMobile = display.mobile;

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
    handlePageClick(page, event) {
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

.one-liner {
  white-space: normal;
  overflow: hidden;
  text-overflow: clip;
  word-break: break-all;

  display: -webkit-inline-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.nav-scroll > .v-navigation-drawer__content {
  scrollbar-width: thin; /* firefox fall back */
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.5);
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
  background-color: var(--v-background-lighten1);
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
</style>
