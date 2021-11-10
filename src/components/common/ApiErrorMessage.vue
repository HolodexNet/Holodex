<template>
  <v-row>
    <v-col class="ma-auto text-center pa-8">
      <div class="text-h4">
        {{ $t("component.apiError.title") }}
      </div>
      <div class="text-body-1">
        {{ $t("component.apiError.textBeforeTwitter") }}
        (<a href="https://twitter.com/holodex" rel="noopener noreferrer"> @holodex </a>)
        {{ $t("component.apiError.textAfterTwitter") }}
        <router-link to="/about">
          {{ $t("component.apiError.aboutPage") }}
        </router-link>
        {{ $t("component.apiError.afterAboutPageHyperlink") }}

        <br>
        <v-btn @click="$store.dispatch('logout')">
          {{ $t("component.mainNav.logout") }}
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {
    name: "ApiErrorMessage",
    mounted() {
        // Temporarily nuke these 301 caches
        fetch(`https://holodex.net/api/v2/live?type=placeholder%2Cstream&org=${this.$store.state.currentOrg.name}`, { method: "post" }).then(() => {});
        fetch("https://holodex.net/api/v2/users/live?includePlaceholder=true", { method: "post" }).then(() => {});
        fetch("https://holodex.net/api/v2/users/favorites", { method: "post" }).then(() => {});
    },
};
</script>

<style></style>
