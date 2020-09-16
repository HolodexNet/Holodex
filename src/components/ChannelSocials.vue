<template>
    <v-list-item-action :class="{ 'v-list-item-horizontal': !vertical }">
        <v-btn
            v-if="channel.yt_channel_id"
            icon
            sm
            :href="`https://www.youtube.com/channel/${channel.yt_channel_id}`"
            target="_blank"
        >
            <v-icon color="#C4302B">{{ mdiYoutube }}</v-icon>
        </v-btn>
        <v-btn
            v-if="channel.twitter_link"
            icon
            sm
            :href="`https://twitter.com/${channel.twitter_link}`"
            target="_blank"
        >
            <v-icon color="#00ACEE"> {{ mdiTwitter }} </v-icon>
        </v-btn>
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon sm>
                    <v-icon color="grey" v-bind="attrs" v-on="on">
                        {{ mdiHeart }}
                    </v-icon>
                </v-btn>
            </template>
            <span>Coming soon!</span>
        </v-tooltip>
    </v-list-item-action>
</template>

<script>
import { mdiYoutube, mdiTwitter, mdiHeart } from "@mdi/js";
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
};
</script>

<style>
.v-list-item-horizontal {
    flex-direction: row;
    align-self: center !important;
}
</style>
