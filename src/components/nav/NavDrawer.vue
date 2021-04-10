<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="240"
        clipped
        class="nav-scroll thin-scroll-bar"
        :temporary="temporary"
        style="padding-top: env(safe-area-inset-top)"
    >
        <slot />
        <v-list dense class="pb-0">
            <!-- <v-list> -->
            <template v-for="page in pages">
                <v-list-item
                    link
                    :key="page.name"
                    @click.prevent="handlePageClick(page)"
                    :href="page.path"
                    :class="{ 'v-list-item--active': $route.path === page.path }"
                >
                    <v-list-item-icon>
                        <v-icon>{{ page.icon }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title v-html="page.name"> </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider v-if="page.divider" :key="`${page.path}-divider`" />
            </template>
            <!-- </v-list> -->
        </v-list>
        <v-divider />
        <v-list dense>
            <v-subheader class="text-overline">
                {{ this.$t("component.mainNav.favorites") }}
            </v-subheader>
            <template v-for="channel in collapsedFavorites">
                <v-list-item
                    v-if="channel"
                    :key="channel.id"
                    @click="$router.push(`/channel/${channel.id}`).catch(() => {})"
                >
                    <v-list-item-avatar :size="30" :class="{ outlined: isLive(channel) }">
                        <ChannelImg :channel="channel" :size="30" />
                    </v-list-item-avatar>
                    <ChannelInfo :channel="channel" noSubscriberCount noGroup />
                    <v-list-item-action-text v-if="isLive(channel) || getChannelLiveAtTime(channel)">
                        <span class="ch-live" v-if="isLive(channel)">●</span>
                        <span class="ch-upcoming" v-else>{{ formatDurationLive(getChannelLiveAtTime(channel)) }}</span>
                    </v-list-item-action-text>
                </v-list-item>
            </template>
            <v-list-item link @click="favoritesExpanded = !favoritesExpanded" v-if="favorites.length > 8">
                <v-list-item-action>
                    <v-icon>{{ favoritesExpanded ? icons.mdiChevronUp : icons.mdiChevronDown }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ favoritesExpanded ? "Close" : "Show All" }}
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
                    <v-icon small>{{ icons.mdiEarth }}</v-icon>
                    <span class="px-1">{{ language }}</span>
                    <v-icon small>{{ icons.mdiMessageCogOutline }}</v-icon>
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

function getChannelLiveAtTime(ch) {
    if (ch.videos && ch.videos[0]) {
        return dayjs(ch.videos[0].start_actual || ch.videos[0].start_scheduled).valueOf();
    }
    return null;
}

export default {
    name: "NavDrawer",
    components: {
        ChannelImg,
        ChannelInfo,
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
        };
    },
    computed: {
        // ...mapState("favorites", ["favorites", "live"]),
        language() {
            return langs.find((x) => x.val === this.$store.state.settings.lang).display;
        },
        favorites() {
            const fav = this.$store.state.favorites.favorites.slice(0);
            const nameProp = this.$store.state.settings.nameProperty;
            const lives = this.$store.state.favorites.live;
            const updateNotice = this.$store.state.favorites.lastLiveUpdate;
            console.debug(`Updating favs: ${updateNotice}`);
            // this console debug is left in to maintain reactivity to `updateNotice`.

            const favWithVideos = fav.map((x) => {
                const videos: Array<any> = lives.filter((v) => v.channel.id === x.id);
                videos.sort(
                    (a, b) =>
                        dayjs(a.start_actual || a.start_scheduled).valueOf() -
                        dayjs(b.start_actual || a.start_scheduled).valueOf(),
                );
                return {
                    ...x,
                    videos,
                };
            });
            // make sure nav works even if sort fails for some reason
            try {
                favWithVideos.sort((a, b) => {
                    const aLive = getChannelLiveAtTime(a);
                    const bLive = getChannelLiveAtTime(b);
                    if (aLive && bLive) {
                        return aLive - bLive;
                    }
                    if (aLive) return -1;
                    if (bLive) return 1;
                    return (
                        (a[nameProp] && b[nameProp] && a[nameProp].localeCompare(b[nameProp])) ||
                        a.name.localeCompare(b.name)
                    );
                    // fall back if english name doesn't exist
                });
            } catch (e) {
                console.log(e);
            }
            return favWithVideos;
        },
        collapsedFavorites() {
            return !this.favoritesExpanded && this.favorites.length > 8 ? this.favorites.slice(0, 8) : this.favorites;
        },
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.$router.go(0)
                : this.$router.push({ path: page.path });
        },
        formatDurationLive(ts) {
            const secs = dayjs(ts).diff(dayjs()) / 1000;
            const h = Math.floor(secs / (60 * 60));
            const m = Math.floor((secs % (60 * 60)) / 60);
            return h ? `${h}h` : `${m}m`;
        },
        isLive(channel) {
            return channel.videos && channel.videos[0] && channel.videos[0].status === "live";
        },
        getChannelLiveAtTime,
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
