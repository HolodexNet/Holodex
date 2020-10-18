<template>
    <v-list-item-action
        :class="{ 'v-list-item-horizontal': !vertical }"
        @click.stop=""
    >
        <v-btn
            v-if="channel.yt_channel_id"
            icon
            sm
            :href="`https://www.youtube.com/channel/${channel.yt_channel_id}`"
            rel="noreferrer"
            target="_blank"
            @click.stop=""
        >
            <v-icon color="#C4302B">{{ mdiYoutube }}</v-icon>
        </v-btn>
        <v-btn
            v-if="channel.twitter_link"
            icon
            sm
            :href="`https://twitter.com/${channel.twitter_link}`"
            rel="noreferrer"
            target="_blank"
            @click.stop=""
        >
            <v-icon color="#00ACEE"> {{ mdiTwitter }} </v-icon>
        </v-btn>
        <v-tooltip bottom v-if="channel.id < 1000">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon sm>
                    <v-icon
                        :color="isFavorited ? 'red' : 'grey'"
                        v-bind="attrs"
                        v-on="on"
                        @click.stop="toggleFavorite"
                    >
                        {{ mdiHeart }}
                    </v-icon>
                </v-btn>
            </template>
            <span>
                {{
                    !isFavorited ? "Add to Favorites" : "Remove from Favorites"
                }}
            </span>
        </v-tooltip>
    </v-list-item-action>
</template>

<script>
import { mdiYoutube, mdiTwitter, mdiHeart } from "@mdi/js";
import { mapMutations } from "vuex";

export default {
    data() {
        return {
            mdiYoutube,
            mdiTwitter,
            mdiHeart,
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
    },
    computed: {
        isFavorited() {
            return this.$store.state.favorites.includes(this.channel.id);
        },
    },
    methods: {
        ...mapMutations(["addFavorite", "removeFavorite"]),
        toggleFavorite() {
            this.isFavorited
                ? this.removeFavorite(this.channel.id)
                : this.addFavorite(this.channel.id);
        },
    },
};
</script>

<style>
.v-list-item-horizontal {
    flex-direction: row !important;
    align-self: center !important;
    padding: 16px 0px 16px 16px !important;
    margin: 0px !important;
}
</style>
