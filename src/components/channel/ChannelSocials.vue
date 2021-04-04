<template>
    <!-- prevent default on entire div to make dead click zone -->
    <div :class="{ 'channel-social-horizontal': !vertical }" @click.stop="">
        <v-btn
            v-if="channel.id && !hideYt"
            icon
            sm
            :href="`https://www.youtube.com/channel/${channel.id}`"
            rel="noreferrer"
            target="_blank"
        >
            <v-icon color="#C4302B">{{ icons.mdiYoutube }}</v-icon>
        </v-btn>
        <v-btn
            v-if="channel.twitter && !hideTwitter"
            icon
            sm
            :href="`https://twitter.com/${channel.twitter}`"
            rel="noreferrer"
            target="_blank"
        >
            <v-icon color="#00ACEE">{{ icons.mdiTwitter }}</v-icon>
        </v-btn>
        <v-tooltip bottom v-if="channel.type === 'vtuber' && !hideFav">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon sm elevation="0" @click.stop="toggleFavorite($event)" v-on="on" v-bind="attrs">
                    <v-icon :color="isFavorited && isLoggedIn ? 'red' : 'gray'">
                        {{ isFavorited ? icons.mdiHeart : mdiHeartOutline }}
                    </v-icon>
                    <!-- <span                         :left="isFavorited" v-if="isFavorited">FAV</span> -->
                </v-btn>
            </template>
            <span>
                {{ tooltip }}
            </span>
        </v-tooltip>
        <v-tooltip bottom v-if="showDelete">
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    :icon="!isBlocked"
                    :color="isBlocked ? 'red' : 'grey'"
                    v-bind="attrs"
                    v-on="on"
                    sm
                    @click.stop.prevent="toggleBlocked"
                >
                    <v-icon :left="isBlocked">
                        {{ mdiAccountCancel }}
                    </v-icon>
                    <span v-if="isBlocked">Blocked</span>
                </v-btn>
            </template>
            <span>
                {{ blockTooltip }}
            </span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import { mdiAccountCancel, mdiHeartOutline } from "@mdi/js";

export default {
    data() {
        return {
            mdiAccountCancel,
            mdiHeartOutline,
        };
    },
    props: {
        channel: {
            type: Object,
            required: true,
        },
        vertical: {
            type: Boolean,
            required: false,
        },
        hideYt: {
            type: Boolean,
            default: false,
            required: false,
        },
        hideTwitter: {
            type: Boolean,
            default: false,
            required: false,
        },
        hideFav: {
            type: Boolean,
            default: false,
            required: false,
        },
        showDelete: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    computed: {
        tooltip() {
            if (!this.isLoggedIn) return "Sign in to favorite";

            return !this.isFavorited
                ? this.$t("component.channelSocials.addToFavorites")
                : this.$t("component.channelSocials.removeFromFavorites");
        },
        blockTooltip() {
            return !this.isBlocked
                ? this.$t("component.channelSocials.block")
                : this.$t("component.channelSocials.unblock");
        },
        isBlocked() {
            return this.$store.getters["settings/blockedChannelIDs"].has(this.channel.id);
        },
        isFavorited() {
            return this.$store.getters["favorites/isFavorited"](this.channel.id);
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
    },
    methods: {
        // ...mapMutations(["addFavorite", "removeFavorite"]),
        toggleFavorite(event) {
            event.preventDefault();
            if (!this.isLoggedIn) return;
            this.$store.commit("favorites/toggleFavorite", this.channel.id);
            this.$store.dispatch("favorites/updateFavorites");
            // this.isFavorited ? this.removeFavorite(this.channel.id) : this.addFavorite(this.channel.id);
        },
        toggleBlocked() {
            this.$store.commit("settings/toggleBlocked", this.channel);
        },
    },
};
</script>

<style>
.channel-social-horizontal {
    flex-direction: row !important;
    align-self: center !important;
    padding: 16px 0 16px 16px;
    margin: 0 !important;
    flex: 0 1 auto !important;
}
</style>
