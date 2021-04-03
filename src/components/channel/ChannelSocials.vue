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
                <v-btn icon sm>
                    <v-icon
                        :color="isFavorited && isLoggedIn ? 'red' : 'grey'"
                        v-bind="attrs"
                        v-on="on"
                        @click.stop="toggleFavorite($event)"
                    >
                        {{ icons.mdiHeart }}
                    </v-icon>
                </v-btn>
            </template>
            <span>
                {{ tooltip }}
            </span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
import * as icons from "@/utils/icons";
// import { mapMutations } from "vuex";

export default {
    data() {
        return {
            icons,
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
    },
    computed: {
        tooltip() {
            if (!this.isLoggedIn) return "Sign in to favorite";

            return !this.isFavorited
                ? this.$t("component.channelSocials.addToFavorites")
                : this.$t("component.channelSocials.removeFromFavorites");
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
