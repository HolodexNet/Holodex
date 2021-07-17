<template>
    <org-selector
        v-if="horizontal"
        @changed="
            (neworg) => {
                currentTab = neworg;
            }
        "
        :currentSelection="currentTab"
        :hideAllVTubers="true"
    >
        <template v-slot:visible="{ activator }">
            <v-btn v-on="activator.on" v-bind="activator.attrs" depressed>
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
        <template v-slot:prepend-dropdown>
            <v-list-item @click="currentTab = favTab" :input-value="currentTab === favTab">
                <v-list-item-title>
                    {{ $t("component.mainNav.favorites") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item @click="currentTab = ytTab" :input-value="currentTab === ytTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiYoutube }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>
            <v-list-item @click="currentTab = twitchTab" :input-value="currentTab === twitchTab">
                <v-list-item-title>
                    <v-icon>{{ mdiTwitch }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>
        </template>
    </org-selector>
    <org-selector
        v-else
        @changed="
            (neworg) => {
                currentTab = neworg;
                $emit('changed', neworg);
            }
        "
        :hideAllVTubers="true"
    >
        <template v-slot:menu="{ showOrgDialog }">
            <v-list-item @click="currentTab = favTab" :input-value="currentTab === favTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiHeart }}</v-icon> {{ $t("component.mainNav.favorites") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item @click="currentTab = playlistTab" :input-value="currentTab === playlistTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiPlaylistPlay }}</v-icon> {{ $t("component.mainNav.playlist") }}
                </v-list-item-title>
            </v-list-item>

            <v-list-item @click="currentTab = ytTab" :input-value="currentTab === ytTab">
                <v-list-item-title>
                    <v-icon>{{ icons.mdiYoutube }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>

            <v-list-item @click="currentTab = twitchTab" :input-value="currentTab === twitchTab">
                <v-list-item-title>
                    <v-icon>{{ mdiTwitch }}</v-icon> URL
                </v-list-item-title>
            </v-list-item>

            <v-list-item-group :value="currentTab">
                <template v-for="org in $store.state.orgFavorites">
                    <v-list-item
                        :key="org.name + 's051'"
                        :value="org"
                        v-if="org.name !== 'All Vtubers'"
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
            if (this.currentTab === oldval) {
                this.currentTab = newval;
            }
        },
    },
    props: {
        horizontal: {
            type: Boolean,
            default: false,
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
