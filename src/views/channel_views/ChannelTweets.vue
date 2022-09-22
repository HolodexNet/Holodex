<template>
  <v-container>
    <a
      class="twitter-timeline"
      :data-height="$store.state.isMobile ? '700%' : '800%'"
      :data-theme="$vuetify.theme.dark ? 'dark' : 'light'"
      :href="`https://twitter.com/${channelTwitter}`"
    >
      Loading Tweets from {{ channelName }}...
    </a>
  </v-container>
</template>

<script lang="ts">

export default {
    name: "ChannelTweets",
    metaInfo() {
        const vm = this;
        return {
            title: `${vm.channelName} - Tweets - Holodex`,
        };
    },
    computed: {
        channel() {
            return this.$store.state.channel.channel;
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            return this.channel[prop] || this.channel.name;
        },
        channelTwitter() {
            return this.channel.twitter;
        },
    },
    mounted() {
        const tweetScript = document.createElement("script");
        tweetScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
        document.head.appendChild(tweetScript);
    },
};
</script>
