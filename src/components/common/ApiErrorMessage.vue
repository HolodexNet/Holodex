<template>
  <v-row>
    <v-col
      cols="12"
      class="ma-auto text-center"
    >
      <div class="text-h4">
        <v-btn small href="/">
          <v-icon>{{ icons.mdiRefresh }}</v-icon>
        </v-btn>
        {{ $t("component.apiError.title") }}
      </div>
      <div class="text-body-1">
        {{ $t("component.apiError.textBeforeTwitter") }}
        (<a href="https://twitter.com/holodex" rel="noopener noreferrer"> @holodex </a>)
        {{ $t("component.apiError.textAfterTwitter") }}
        <a href="https://discord.gg/jctkgHBt4b">Discord</a>{{ $t("component.apiError.afterAboutPageHyperlink") }}
        <br>
        Tip: Hard Refresh/Clear Cache: <code>CTRL + SHIFT + R</code>
        <br v-if="$store.state.userdata.user">
        <v-btn v-if="$store.state.userdata.user" small @click="$store.dispatch('logout')">
          {{ $t("component.mainNav.logout") }}
        </v-btn>
      </div>
    </v-col>
    <v-col
      cols="auto"
      class="mx-auto my-0"
    >
      <twitter-feed />
    </v-col>
  </v-row>
</template>

<script lang="ts">
// import VGoogleTranslate from "v-google-translate/src/packages/src/index.vue";
import TwitterFeed from "./TwitterFeed.vue";

export default {
    name: "ApiErrorMessage",
    components: { TwitterFeed },
    data() {
        return {
            unclean: false,
        };
    },
    mounted() {
        // Temporarily nuke these 301 caches
        // fetch(`https://holodex.net/api/v2/live?type=placeholder%2Cstream&org=${this.$store.state.currentOrg.name}`, { method: "post" }).then(() => {});
        // fetch("https://holodex.net/api/v2/users/live?includePlaceholder=true", { method: "post" }).then(() => {});
        // fetch("https://holodex.net/api/v2/users/favorites", { method: "post" }).then(() => {});
    },
    deactivated() {
        if (this.unclean) {
            window.location.reload();
        }
    },
};
</script>

<style>
ul .language {
  color: black;
}
</style>
