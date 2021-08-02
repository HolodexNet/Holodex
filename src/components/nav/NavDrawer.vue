<template>
  <v-navigation-drawer
    :value="value"
    app
    width="240"
    clipped
    class="nav-scroll thin-scroll-bar"
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
          :class="{ 'v-list-item--active': $route.path === page.path }"
          @click.prevent="handlePageClick(page)"
        >
          <v-list-item-icon>
            <v-icon>{{ page.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-html="page.name" />
          </v-list-item-content>
          <!-- Quick Settings Popup -->
          <v-list-item-icon v-if="page.path === '/settings'">
            <v-menu
              right
              nudge-right
              max-height="80vh"
              :close-on-content-click="false"
            >
              <template #activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" @click.stop.prevent>
                  {{ mdiTuneVariant }}
                </v-icon>
              </template>
              <v-card rounded="lg" class="py-n2 scrollable">
                <settings slim />
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
          @click="$router.push(`/channel/${vid.channel.id}`).catch(() => {})"
        >
          <v-list-item-avatar :size="30" :class="{ outlined: isLive(vid) }">
            <ChannelImg :channel="vid.channel" :size="30" />
          </v-list-item-avatar>
          <ChannelInfo :channel="vid.channel" no-subscriber-count no-group />
          <v-list-item-action-text v-if="vid.id" :key="'liveclock' + vid.id + tick">
            <span v-if="isLive(vid)" class="ch-live">●</span>
            <span v-else class="ch-upcoming">
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
      <v-list-item>
        <router-link to="/channel" style="font-size: 0.825rem" class="ma-auto">
          {{ $t("views.favorites.manageFavorites") }}
        </router-link>
      </v-list-item>
      <v-list-item>
        <router-link to="/settings" style="font-size: 0.825rem" class="ma-auto">
          <v-icon small>
            {{ icons.mdiEarth }}
          </v-icon>
          <span class="px-1">{{ language }}</span>
          <v-icon small>
            {{ icons.mdiMessageCogOutline }}
          </v-icon>
        </router-link>
      </v-list-item>
    </v-list>
    <!-- </v-list> -->
  </v-navigation-drawer>
</template>

<script lang="ts">
import ChannelImg from "@/components/channel/ChannelImg.vue";
import ChannelInfo from "@/components/channel/ChannelInfo.vue";
import { langs } from "@/plugins/vuetify";
import { dayjs } from "@/utils/time";
import { mdiTuneVariant } from "@mdi/js";

// function getChannelLiveAtTime(ch) {
//     if (ch.videos && ch.videos[0]) {
//         return dayjs(ch.videos[0].start_actual || ch.videos[0].start_scheduled).valueOf();
//     }
//     return null;
// }

export default {
    name: "NavDrawer",
    components: {
        ChannelImg,
        ChannelInfo,
        Settings: () => import("@/views/Settings.vue"),
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

            mdiTuneVariant,
        };
    },
    computed: {
        // ...mapState("favorites", ["favorites", "live"]),
        language() {
            return langs.find((x) => x.val === this.$store.state.settings.lang).display;
        },
        favorites() {
            const fav = this.$store.state.favorites.favorites;
            try {
                const favoritesSet = new Set(fav.map((x) => x.id));
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
                return [...Object.values(existingChs), ...extras];
            } catch (e) {
                console.error(e);
            }

            // fall back in case something fails above
            return fav.map((ch) => ({
                channel: ch,
            }));
        },
        collapsedFavorites() {
            return !this.favoritesExpanded && this.favorites.length > 8 ? this.favorites.slice(0, 8) : this.favorites;
        },
    },
    mounted() {
        this.ticker = setInterval(() => {
            this.tick = Date.now();
        }, 60000);
    },
    beforeDestroy() {
        if (this.ticker) clearInterval(this.ticker);
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.$router.go(0)
                : this.$router.push({ path: page.path });
        },
        formatDurationUpcoming(ts) {
            const secs = dayjs(ts).diff(dayjs()) / 1000;
            if (secs > 0) {
                const h = Math.floor(secs / (60 * 60));
                const m = Math.floor((secs % (60 * 60)) / 60);
                return h ? `${h}h` : `${m}m`;
            }
            return "●";
        },
        isLive(video) {
            return video.status === "live";
        },
        // getChannelLiveAtTime,
    },
};
</script>

<style>
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
}

.outlined {
    position: relative;
    box-shadow: 0 0 0 2px red, 0 0 4px 3px rgba(255, 0, 0, 0.56);
}
.ch-live {
    font-size: large;
    color: red;
}
.ch-upcoming {
    font-size: small;
    line-height: 24px;
}
</style>
