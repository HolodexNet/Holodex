<template>
    <div>
        <v-navigation-drawer v-model="drawer" app width="256" clipped>
            <v-list dense>
                <v-list-item link :to="'/'">
                    <v-list-item-action>
                        <v-icon>{{ mdiHome }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Home</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link :to="'/channel'">
                    <v-list-item-action>
                        <v-icon>{{ mdiAnimationPlay }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Channels</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <v-icon>{{ mdiHelpCircle }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>About</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <v-icon>{{ mdiCog }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group :prepend-icon="mdiHeart" value="true">
                    <template v-slot:activator>
                        <v-list-item-title>Favorites</v-list-item-title>
                    </template>
                    <v-list-item
                        v-for="channel in favoritedChannels"
                        :key="channel.id"
                        @click="
                            $router
                                .push(`/channel/${channel.id}`)
                                .catch(() => {})
                        "
                    >
                        <v-list-item-avatar>
                            <ChannelImg :src="channel.photo" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="channel" noSubscriberCount />
                    </v-list-item>
                    <v-list-item
                        link
                        @click="favoritesExpanded = !favoritesExpanded"
                        v-if="favoritedChannels.length > 10"
                    >
                        <v-list-item-action>
                            <v-icon>{{
                                favoritesExpanded
                                    ? mdiChevronUp
                                    : mdiChevronDown
                            }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>Show All</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <router-link
                            to="/channel"
                            style="font-size: .825rem"
                            class="ma-auto"
                        >
                            Manage Favorites
                        </router-link>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar color="blue lighten-2" app clipped-left flat>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer">
                <v-icon>{{ mdiMenu }}</v-icon>
            </v-app-bar-nav-icon>
            <v-toolbar-title class="pr-5">
                <router-link
                    :to="'/'"
                    style="text-decoration: none; color: white"
                >
                    HoloSubs
                </router-link>
            </v-toolbar-title>

            <v-text-field
                flat
                hide-details
                label="Search"
                :prepend-inner-icon="mdiMagnify"
                solo-inverted
                style="max-width: 500px"
                class="ma-auto"
            ></v-text-field>
        </v-app-bar>
    </div>
</template>

<script>
import {
    mdiHome,
    mdiAnimationPlay,
    mdiHelpCircle,
    mdiCog,
    mdiMagnify,
    mdiMenu,
    mdiHeart,
    mdiChevronUp,
    mdiChevronDown,
} from "@mdi/js";
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
export default {
    components: {
        ChannelImg,
        ChannelInfo,
    },
    data: () => ({
        drawer: null,
        ...{
            mdiHome,
            mdiAnimationPlay,
            mdiHelpCircle,
            mdiCog,
            mdiMagnify,
            mdiMenu,
            mdiHeart,
            mdiChevronUp,
            mdiChevronDown,
        },
        favoritesExpanded: false,
    }),
    computed: {
        favoritedChannels() {
            if (
                !this.$store.state.cachedChannels ||
                !this.$store.state.favorites
            )
                return [];

            // get favorites
            const favs = this.$store.state.favorites;
            // check cache for missing favorites
            this.$store.dispatch("checkFavorites");
            // return favorited channel list from cache
            const arr = Object.values(this.$store.state.cachedChannels).filter(channel => favs.includes(channel.id));
            return this.favoritesExpanded ? arr : arr.splice(0, 10);
        },
    },
};
</script>

<style></style>
