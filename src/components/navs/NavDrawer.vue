<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="240"
        clipped
        class="nav-scroll"
    >
        <v-list dense>
            <template v-for="page in pages">
                <v-list-item
                    link
                    :key="page.name"
                    @click="handlePageClick(page)"
                    :class="{ 'v-list-item--active': $route.path === page.path }"
                >
                    <v-list-item-action>
                        <v-icon>{{ page.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ page.name }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
            <v-divider />
            <v-list>
                <v-subheader>
                    {{ this.$t("component.mainNav.favorites") }}
                </v-subheader>
                <template v-for="channel in favoritedChannels">
                    <v-list-item
                        v-if="channel"
                        :key="channel.id"
                        @click="$router.push(`/channel/${channel.id}`).catch(() => {})"
                    >
                        <v-list-item-avatar :size="35">
                            <ChannelImg :channel="channel" />
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
                    <router-link to="/channel" style="font-size: 0.825rem" class="ma-auto">
                        Manage Favorites
                    </router-link>
                </v-list-item>
                <v-list-item>
                    <router-link to="/settings" style="font-size: 0.825rem" class="ma-auto">
                        <v-icon small>{{ mdiEarth }}</v-icon>
                        <span class="px-1">{{ language }}</span>
                        <v-icon small>{{ mdiMessageCogOutline }}</v-icon>
                    </router-link>
                </v-list-item>
            </v-list>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
import { mdiChevronDown, mdiChevronUp, mdiEarth, mdiHeart, mdiMessageCogOutline } from "@mdi/js";
import { langs } from "@/plugins/vuetify";

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
        currentPage: {
            type: String,
            color: "primary",
        },
    },
    data() {
        return {
            mdiHeart,
            favoritesExpanded: true,
            mdiChevronDown,
            mdiChevronUp,
            mdiEarth,
            mdiMessageCogOutline,
        };
    },
    computed: {
        language() {
            return langs.find((x) => x.val === this.$store.state.lang).display;
        },
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        favoritedChannels() {
            if (!this.$store.state.cachedChannels || !this.$store.state.favorites) return [];
            // check cache for missing favorites
            this.$store.dispatch("checkChannelCache");
            // return favorited channel list from cache
            const arr = this.favorites.map((channelId) =>
                Object.hasOwnProperty.call(this.cachedChannels, channelId) ? this.cachedChannels[channelId] : null,
            );

            return !this.favoritesExpanded && this.favorites.length > 5 ? arr.splice(0, 5) : arr;
        },
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path ? this.$router.go(0) : this.$router.push({ path: page.path });
        },
    },
};
</script>

<style>
.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar {
    width: 8px; /* for vertical scrollbars */
    height: 8px; /* for horizontal scrollbars */
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
}

.nav-scroll > .v-navigation-drawer__content:hover {
    overflow-y: auto !important;
    overscroll-behavior: contain;
}

.nav-scroll > .v-navigation-drawer__content {
    overflow-y: hidden !important;
}
</style>
