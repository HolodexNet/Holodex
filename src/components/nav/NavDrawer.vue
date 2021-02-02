<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="240"
        clipped
        class="nav-scroll"
        :temporary="temporary"
    >
        <v-list dense>
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
            </template>
            <!-- </v-list> -->
        </v-list>
        <v-divider />
        <v-list dense>
            <v-subheader class="text-overline">
                {{ this.$t("component.mainNav.favorites") }}
            </v-subheader>
            <!-- <template v-for="channel in favoritedChannels">
                    <v-list-item
                        v-if="channel"
                        :key="channel.id"
                        @click="$router.push(`/channel/${channel.id}`).catch(() => {})"
                    >
                        <v-list-item-avatar :size="35">
                            <ChannelImg :channel="channel" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="channel" noSubscriberCount noGroup />
                        <v-list-item-action v-if="channel.live" @click.stop="">
                            <v-tooltip right>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-chip
                                        label
                                        small
                                        :outlined="channel.live.status !== 'live'"
                                        :color="channel.live.status == 'live' ? 'red' : 'blue'"
                                        :class="{ 'elevation-2': channel.live.status == 'live' }"
                                        class="live-badge"
                                        :to="`/watch/${channel.live.id}`"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span style="min-width: 24px; text-align: center">
                                            {{
                                                channel.live.status == "live"
                                                    ? "LIVE"
                                                    : formatTimeLabel(channel.live.start_scheduled)
                                            }}
                                        </span>
                                    </v-chip>
                                </template>
                                <span>
                                    {{
                                        channel.live.status == "live"
                                            ? "Watch now"
                                            : formatDistance(channel.live.start_scheduled)
                                    }}
                                </span>
                            </v-tooltip>
                        </v-list-item-action>
                    </v-list-item>
                </template> -->
            <template v-for="channel in collapsedFavorites">
                <v-list-item
                    v-if="channel"
                    :key="channel.id"
                    @click="$router.push(`/channel/${channel.id}`).catch(() => {})"
                >
                    <v-list-item-avatar :size="30">
                        <ChannelImg :channel="channel" :size="30" />
                    </v-list-item-avatar>
                    <ChannelInfo :channel="channel" noSubscriberCount noGroup />
                </v-list-item>
            </template>
            <v-list-item link @click="favoritesExpanded = !favoritesExpanded" v-if="favorites.length > 5">
                <v-list-item-action>
                    <v-icon>{{ favoritesExpanded ? mdiChevronUp : mdiChevronDown }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ favoritesExpanded ? "Close" : "Show All" }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <router-link to="/channel" style="font-size: 0.825rem" class="ma-auto"> Manage Favorites </router-link>
            </v-list-item>
            <v-list-item>
                <router-link to="/settings" style="font-size: 0.825rem" class="ma-auto">
                    <v-icon small>{{ mdiEarth }}</v-icon>
                    <span class="px-1">{{ language }}</span>
                    <v-icon small>{{ mdiMessageCogOutline }}</v-icon>
                </router-link>
            </v-list-item>
        </v-list>
        <!-- </v-list> -->
    </v-navigation-drawer>
</template>

<script>
import ChannelImg from "@/components/channel/ChannelImg";
import ChannelInfo from "@/components/channel/ChannelInfo";
import { mdiChevronDown, mdiChevronUp, mdiEarth, mdiHeart, mdiMessageCogOutline } from "@mdi/js";
import { langs } from "@/plugins/vuetify";
import { mapState } from "vuex";
import { formatDistance, dayjs } from "@/utils/time";

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
            favoritesExpanded: true,
            mdiHeart,
            mdiChevronDown,
            mdiChevronUp,
            mdiEarth,
            mdiMessageCogOutline,
        };
    },
    computed: {
        ...mapState(["favorites", "cachedChannels", "live"]),
        language() {
            return langs.find((x) => x.val === this.$store.state.settings.lang).display;
        },
        favorites() {
            const fav = this.$store.state.favorites.favorites.slice(0);
            const nameProp = this.$store.state.settings.nameProperty;
            // make sure nav works even if sort fails for some reason
            try {
                fav.sort(
                    (a, b) =>
                        // fall back if english name doesn't exist
                        (a[nameProp] && b[nameProp] && a[nameProp].localeCompare(b[nameProp])) ||
                        a.name.localeCompare(b.name),
                );
            } catch (e) {
                console.log(e);
            }
            return fav;
        },
        collapsedFavorites() {
            return !this.favoritesExpanded && this.favorites.length > 5 ? this.favorites.slice(0, 5) : this.favorites;
        },
        // favoritedChannels() {
        //     if (!this.$store.state.cachedChannels || !this.$store.state.favorites) return [];
        //     // check cache for missing favorites
        //     this.$store.dispatch("checkChannelCache");
        //     // return favorited channel list from cache
        //     const arr = this.favorites.map((channelId) => {
        //         // make shallow copy of object to not modify state
        //         if (Object.hasOwnProperty.call(this.cachedChannels, channelId)) {
        //             const channel = this.cachedChannels[channelId];
        //             // clear any lives
        //             channel.live = null;
        //             return channel;
        //         }
        //         return null;
        //     });

        //     // add live video obj to channel
        //     this.live?.forEach((l) => {
        //         const index = this.favorites.indexOf(l.channel.id);
        //         if (index > 0 && !arr[index].live) arr[index].live = l;
        //     });

        //     // sort favorite channels by most upcoming live if any
        //     arr.sort((a, b) => {
        //         if (a.live && b.live) {
        //             const dateA = new Date(a.live.start_scheduled);
        //             const dateB = new Date(b.live.start_scheduled);
        //             return dateA - dateB;
        //         }
        //         if (a.live) return -1;
        //         if (b.live) return 1;
        //         return 0;
        //     });
        //     return !this.favoritesExpanded && this.favorites.length > 5 ? arr.splice(0, 5) : arr;
        // },
    },
    methods: {
        formatDistance,
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.$router.go(0)
                : this.$router.push({ path: page.path });
        },
        formatTimeLabel(time) {
            const hours = dayjs(time).diff(dayjs(), "hour");
            if (hours) {
                return `${hours}h`;
            }
            const minutes = dayjs(time).diff(dayjs(), "minutes");
            return `${minutes}m`;
        },
    },
};
</script>

<style>
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
    overflow-y: overlay !important;
}

/* overflow-y: overlay does not work on temporary drawer */
.nav-scroll.v-navigation-drawer--temporary > .v-navigation-drawer__content:hover {
    overflow-y: auto !important;
}

.nav-scroll > .v-navigation-drawer__content {
    overflow-y: hidden !important;
}

.live-badge {
    padding: 3px 4px !important;
    border-radius: 2px;
    min-width: 32px !important;
}
</style>
