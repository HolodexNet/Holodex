<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="256"
        clipped
    >
        <v-list dense>
            <template v-for="page in pages">
                <v-list-item link :to="page.path" :key="page.name">
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
            <v-list-group :prepend-icon="mdiHeart" value="true">
                <template v-slot:activator>
                    <v-list-item-title>Favorites</v-list-item-title>
                </template>
                <template v-for="channel in favoritedChannels">
                    <v-list-item
                        v-if="channel"
                        :key="channel.id"
                        @click="
                            $router
                                .push(`/channel/${channel.id}`)
                                .catch(() => {})
                        "
                    >
                        <v-list-item-avatar :size="35">
                            <ChannelImg :src="channel.photo" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="channel" noSubscriberCount />
                    </v-list-item>
                </template>
                <v-list-item
                    link
                    @click="favoritesExpanded = !favoritesExpanded"
                    v-if="favorites.length > 10"
                >
                    <v-list-item-action>
                        <v-icon>{{
                            favoritesExpanded ? mdiChevronUp : mdiChevronDown
                        }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ favoritesExpanded ? "Close" : "Show All" }}
                        </v-list-item-title>
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
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
import { mdiHeart } from "@mdi/js";
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
    },
    data() {
        return {
            mdiHeart,
        };
    },
    computed: {
        favorites() {
            return this.$store.state.favorites;
        },
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        favoritedChannels() {
            if (
                !this.$store.state.cachedChannels ||
                !this.$store.state.favorites
            )
                return [];
            // check cache for missing favorites
            this.$store.dispatch("checkFavorites");
            // return favorited channel list from cache
            const arr = this.favorites.map(channel_id =>
                Object.hasOwnProperty.call(this.cachedChannels, channel_id)
                    ? this.cachedChannels[channel_id]
                    : null
            );
            return !this.favoritesExpanded && this.favorites.length > 10
                ? arr.splice(0, 10)
                : arr;
        },
    },
};
</script>

<style></style>
