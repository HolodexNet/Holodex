<template>
    <div>
        <v-btn
            icon
            sm
            :href="`https://www.youtube.com/channel/${channel.yt_channel_id}`"
            target="_blank"
        >
            <v-icon color="#C4302B">mdi-youtube</v-icon>
        </v-btn>
        <v-btn
            icon
            sm
            :href="`https://twitter.com/${channel.twitter_link}`"
            target="_blank"
        >
            <v-icon color="#00ACEE">mdi-twitter</v-icon>
        </v-btn>
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon sm>
                    <v-icon color="grey" v-bind="attrs" v-on="on">
                        mdi-heart
                    </v-icon>
                </v-btn>
            </template>
            <span>Coming soon!</span>
        </v-tooltip>
    </div>
</template>

<script>
export default {
    props: {
        channel: {
            type: Object,
            required: true,
        },
    },
};
</script>

<style></style>
