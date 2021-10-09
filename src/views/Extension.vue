<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-img src="img/holodex-plus/holodex-plus-icon.png" :max-width="32" class="mr-2" /> Holodex Plus Extension
      </v-card-title>
      <v-card-text>
        <div class="d-flex flex-row justify-center flex-wrap">
          <a href="https://chrome.google.com/webstore/detail/holodex-plus/mjcecbpccklceljomllkhilglcdcncbh">
            <v-img
              src="img/holodex-plus/chrome-webstore.png"
              :max-height="58"
              :max-width="170"
              contain
              alt="Chrome Webstore"
            />
          </a>
          <a href="https://addons.mozilla.org/firefox/addon/holodex-plus/">
            <v-img
              src="img/holodex-plus/firefox-amo.png"
              :max-height="50"
              :max-width="170"
              contain
              alt="Firefox AMO"
            />
          </a>
          <v-btn
            class="white--text deep-purple"
            target="_blank"
            href="https://github.com/HolodexNet/Holodex-Plus"
            :height="50"
          >
            <v-icon left large>
              {{ mdiGithub }}
            </v-icon>
            Install <br> from Github
          </v-btn>
        </div>
        <v-row>
          <v-col md="6">
            <v-img src="img/holodex-plus/holodex-plus-screenshot.webp" />
          </v-col>
          <v-col md="6">
            <div class="text-h5 mb-2">
              Features
            </div>
            <ul class="text-body-1">
              <li>Enables Archive Live chat on Watch and Multiview</li>
              <li>Allows liking videos from Holodex watch page</li>
              <li>Fixes memory leak in Youtube's live chat</li>
              <li>Fixes experimental flags on Youtube player (Like disabling multiple streams, waiting room thumbnail not showing) and more!</li>
            </ul>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {
    mdiGithub,
} from "@mdi/js";

export default {
    name: "Extension",
    data() {
        return {
            mdiGithub,
        };
    },
};
</script>

<style>

</style>
