<template>
  <v-navigation-drawer
    :value="value"
    app
    width="220"
    clipped
    class="nav-scroll"
    :temporary="temporary"
    style="padding-top: env(safe-area-inset-top); padding-left: calc(env(safe-area-inset-left) / 1.3)"
    @input="$emit('input', $event)"
  >
    <slot />
    <v-list dense class="pb-0">
      <!-- <v-list> -->
      <template v-for="page in pages">
        <v-list-item
          :key="page.name"
          link
          :href="page.path"
          :class="{ 'v-list-item--active': $route.fullPath === page.path }"
          @click.prevent="handlePageClick(page)"
        >
          <v-list-item-icon>
            <v-icon>{{ page.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-html="page.name" />
          </v-list-item-content>
          <!-- Quick Settings Popup -->
          <v-list-item-icon v-if="page.path === '/settings' && $vuetify.breakpoint.smAndUp">
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
          </v-list-item-icon>
        </v-list-item>
        <v-divider v-if="page.divider" :key="`${page.path}-divider`" />
      </template>
      <!-- </v-list> -->
    </v-list>
    <v-divider />
    <v-list dense>
      <v-subheader class="pl-5 text-overline">
        {{ $t("component.mainNav.favorites") }}
      </v-subheader>
      <template v-for="vid in collapsedFavorites">
        <v-list-item
          v-if="vid"
          :key="vid.id"
          :class="{ 'v-list-item--active': $route.path.startsWith(`/channel/${vid.channel.id}`) }"
          @click="$router.push(`/channel/${vid.channel.id}`).catch(() => {})"
        >
          <v-list-item-avatar :size="30" :class="{ outlined: isLive(vid) }">
            <ChannelImg :channel="vid.channel" :size="30" />
          </v-list-item-avatar>
          <ChannelInfo :channel="vid.channel" no-subscriber-count no-group />
          <v-list-item-action-text v-if="vid.id" :key="'liveclock' + vid.id + tick">
            <span :class="isLive(vid) ? 'ch-live' : 'ch-upcoming'">
              {{ formatDurationUpcoming(vid.available_at) }}
            </span>
          </v-list-item-action-text>
        </v-list-item>
      </template>
      <v-list-item v-if="favorites.length > 8" link @click="favoritesExpanded = !favoritesExpanded">
        <v-list-item-action>
          <v-icon>{{ favoritesExpanded ? icons.mdiChevronUp : icons.mdiChevronDown }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>
            {{ favoritesExpanded ? $t("views.favorites.close") : $t("views.favorites.showall") }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item dense>
        <router-link to="/channel" style="font-size: 0.825rem" class="ma-auto">
          {{ $t("views.favorites.manageFavorites") }}
        </router-link>
      </v-list-item>
    </v-list>
    <br>
    <v-sheet id="bottom-bar" dense class="grey--text mt-auto mb-0">
      <a href="https://twitter.com/holodex" title="Twitter">
        <v-icon small color="#1DA1F2">{{ icons.mdiTwitter }}</v-icon>
      </a>
      <a class="mx-2" title="Support holodex (Ko-fi)" href="https://ko-fi.com/holodex">
        <v-icon small color="#FF5E5B">M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z</v-icon>
      </a>
      <span>
        <small class="one-liner" style="font-size: 0.7rem;">© 2020 Holodex</small>
      </span>

      <v-icon x-small color="grey" class="ml-auto">
        {{ icons.mdiEarth }}
      </v-icon>
      <router-link to="/settings" class=" one-liner">
        <small class="pl-1" style="font-size: 0.7rem">{{ language }}</small>
      </router-link>
    </v-sheet>

    <!-- </v-list> -->
  </v-navigation-drawer>
</template>

<script lang="ts">
import ChannelImg from "@/components/channel/ChannelImg.vue";
import ChannelInfo from "@/components/channel/ChannelInfo.vue";
import { langs } from "@/plugins/vuetify";
import { dayjs, formatDurationShort } from "@/utils/time";
import { mdiTuneVariant, mdiPatreon } from "@mdi/js";
import Settings from "@/views/Settings.vue";

export default {
    name: "NavDrawer",
    components: {
        ChannelImg,
        ChannelInfo,
        Settings,
    },
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
    data() {
        return {
            favoritesExpanded: false,
            tick: Date.now(),
            ticker: null,
            showSettings: false,

            mdiTuneVariant,
            mdiPatreon,
        };
    },
    computed: {
        // ...mapState("favorites", ["favorites", "live"]),
        language() {
            return langs.find((x) => x.val === this.$store.state.settings.lang).display;
        },
        favorites() {
            const fav = this.$store.state.favorites.favorites || [];
            try {
                const favoritesSet = this.$store.getters["favorites/favoriteChannelIDs"];
                const lives: Array<any> = this.$store.state.favorites.live;
                const updateNotice = this.$store.state.favorites.lastLiveUpdate;
                console.debug(`Updating favs: ${updateNotice}`);

                const existingChs = {};
                lives.forEach((x) => {
                    if (favoritesSet.has(x.channel.id) && !existingChs[x.channel.id]) {
                        existingChs[x.channel.id] = x;
                    }
                });
                // remainder:
                const extras = fav
                    .filter((x) => !existingChs[x.id])
                    .map((ch) => ({
                        channel: ch,
                    }));
                // Sort by name (either english or native)
                extras.sort((a, b) => {
                    const prop = this.$store.state.settings.nameProperty;
                    const name1 = a.channel[prop] || a.channel.name || "";
                    const name2 = b.channel[prop] || b.channel.name || "";
                    return name1.localeCompare(name2);
                });
                return [...Object.values(existingChs), ...extras];
            } catch (e) {
                console.error(e);
                try {
                    return fav.map((ch) => ({
                        channel: ch,
                    }));
                } catch (k) {
                    console.error("fallback also failed LOL");
                    console.error(k);
                    return [];
                }
            }
        },
        collapsedFavorites() {
            return !this.favoritesExpanded && this.favorites.length > 8 ? this.favorites.slice(0, 8) : this.favorites;
        },
    },
    created() {
        if (!this.ticker) {
            this.ticker = setInterval(() => {
                this.tick = Date.now();
            }, 60000);
        }
    },
    beforeDestroy() {
        if (this.ticker) clearInterval(this.ticker);
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.refresh()
                : this.$router.push({ path: page.path });
        },
        async refresh() {
            // here to fetch the data and rerender the contents.
            // check if there's a handler on the sequence
            const handledRefresh = await this.$store.dispatch("reloadCurrentPage", {
                source: "ptr",
                consumed: false,
            });
            // do default refresh if none
            if (!handledRefresh.consumed) {
                this.$router.go(0);
            }
        },
        formatDurationUpcoming(ts) {
            const secs = dayjs(ts).diff(dayjs()) / 1000;
            return formatDurationShort(Math.abs(secs));
        },
        isLive(video) {
            return video.status === "live";
        },
        // getChannelLiveAtTime,
    },
};
</script>

<style>
#bottom-bar {
  font-size: 0.8rem;
  position: absolute;
  width: 100%;
  bottom: 0;
  background-color: var(--v-background-lighten1);
  align-items: center;
  display: flex;
  padding: 3px 16px;
  /* box-shadow: 0px -1px 0px 1px #00000077; */
  border-top: 1px solid var(--v-background-lighten2);
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
