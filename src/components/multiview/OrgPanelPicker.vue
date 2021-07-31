<template>
    <org-selector
        v-if="horizontal"
        :current-selection="currentTab"
        :hide-all-v-tubers="true"
        @changed="
            (neworg) => {
                currentTab = neworg;
            }
        "
    >
        <template #visible="{ activator }">
            <v-btn v-bind="activator.attrs" depressed v-on="activator.on">
                <template v-if="currentTab.name === 'YouTubeURL'">
                    <v-icon>{{ icons.mdiYoutube }}</v-icon> URL
                </template>
                <template v-else-if="currentTab.name === 'TwitchURL'">
                    <v-icon>{{ mdiTwitch }}</v-icon> URL
                </template>
                <template v-else>
                    {{ currentTab.text || currentTab.name }}
                </template>
                <v-icon right small>{{ icons.mdiMenuDown }}</v-icon>
            </v-btn>
        </template>
        <template #prepend-dropdown>
            <v-list-item :input-value="currentTab === favTab" @click="currentTab = favTab">
                <v-list-item-title>
                    {{ $t("component.mainNav.favorites") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item :input-value="currentTab === ytTab" @click="currentTab = ytTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiYoutube }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>
            <v-list-item :input-value="currentTab === twitchTab" @click="currentTab = twitchTab">
                <v-list-item-title>
                    <v-icon>{{ mdiTwitch }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>
        </template>
    </org-selector>
    <org-selector
        v-else
        :hide-all-v-tubers="true"
        @changed="
            (neworg) => {
                currentTab = neworg;
                $emit('changed', neworg);
            }
        "
    >
        <template #menu="{ showOrgDialog }">
            <v-list-item :input-value="currentTab === favTab" @click="currentTab = favTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiHeart }}</v-icon> {{ $t("component.mainNav.favorites") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item :input-value="currentTab === playlistTab" @click="currentTab = playlistTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiPlaylistPlay }}</v-icon> {{ $t("component.mainNav.playlist") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item :input-value="currentTab === ytTab" @click="currentTab = ytTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiYoutube }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>

            <v-list-item :input-value="currentTab === twitchTab" @click="currentTab = twitchTab">
                <v-list-item-title>
                    <v-icon>{{ mdiTwitch }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>

            <v-list-item-group :value="currentTab">
                <template v-for="org in $store.state.orgFavorites">
                    <v-list-item
                        v-if="org.name !== 'All Vtubers'"
                        :key="org.name + 's051'"
                        :value="org"
                        @click="selectOrg(org)"
                    >
                        <v-list-item-content>
                            <v-list-item-title>{{ org.name }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-list-item-group>

            <v-list-item @click="showOrgDialog()">
                <v-list-item-title class="primary--text">{{ $t("views.favorites.showall") }}</v-list-item-title>
            </v-list-item>
        </template>
    </org-selector>
</template>

<script>
import { mdiTwitch } from "@mdi/js";
import OrgSelector from "../common/OrgSelector.vue";

/* Org Selector
    Picks an org or a panel choice like YT URL or Twitch URL or Favorites.
*/
export default {
    components: { OrgSelector },
    props: {
        horizontal: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        const favTab = { name: "Favorites", text: this.$t("component.mainNav.favorites") };
        const currentTab = this.$store.getters.isLoggedIn ? favTab : this.$store.state.currentOrg;
        this.$emit("changed", currentTab);
        return {
            currentTab,
            favTab,
            twitchTab: { name: "TwitchURL", inputType: true },
            ytTab: { name: "YouTubeURL", inputType: true },
            playlistTab: { name: "Playlist", text: this.$t("component.mainNav.playlist") },

            mdiTwitch,
        };
    },
    computed: {
        currentOrg() {
            return this.$store.state.currentOrg;
        },
    },
    watch: {
        currentTab(val) {
            this.$emit("changed", val);
        },
        currentOrg(newval, oldval) {
            if (
                this.currentTab === oldval ||
                this.currentTab.name === this.favTab.name ||
                this.currentTab.name === this.ytTab.name ||
                this.currentTab.name === this.playlistTab.name
            ) {
                this.currentTab = newval;
            }
        },
    },
    methods: {
        selectOrg(val) {
            // console.log("create change", val);
            this.$store.commit("setCurrentOrg", val);
            this.currentTab = val;
        },
    },
};
</script>

<style></style>
