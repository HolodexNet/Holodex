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
                    <v-list-item-avatar :size="30">
                        <ChannelImg :channel="channel" :size="30" />
                    </v-list-item-avatar>
                    <ChannelInfo :channel="channel" noSubscriberCount noGroup />
                </v-list-item>
            </template>
            <v-list-item link @click="favoritesExpanded = !favoritesExpanded" v-if="favorites.length > 5">
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
import { mapState } from "vuex";

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
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.$router.go(0)
                : this.$router.push({ path: page.path });
        },
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
</style>
