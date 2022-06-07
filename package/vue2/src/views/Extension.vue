<template>
  <v-container :class="{'pt-12': $vuetify.breakpoint.mdAndUp}">
    <v-card>
      <v-card-title>
        <v-img src="img/holodex-plus/holodex-plus-icon.png" :max-width="32" class="mr-2" /> {{ $t('views.extension.title') }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col md="6">
            <v-img src="img/holodex-plus/holodex-plus-screenshot.webp" />
          </v-col>
          <v-col md="6">
            <div class="text-h5 mb-2">
              {{ $t('views.extension.features') }}
            </div>
            <ul class="text-body-1">
              <li>{{ $t('views.extension.featureset.one') }}</li>
              <li>{{ $t('views.extension.featureset.two') }}</li>
              <li>{{ $t('views.extension.featureset.three') }}</li>
              <li>{{ $t('views.extension.featureset.four') }}</li>
            </ul>

            <div class="d-flex flex-row justify-center flex-wrap mt-4">
              <a href="https://chrome.google.com/webstore/detail/holodex-plus/mjcecbpccklceljomllkhilglcdcncbh" title="Chrome Webstore" class="mx-1">
                <v-img
                  src="img/holodex-plus/chrome-webstore.png"
                  :max-height="50"
                  :max-width="180"
                  class="rounded-lg"
                  contain
                />
              </a>
              <a
                href="https://addons.mozilla.org/firefox/addon/holodex-plus/"
                title="Firefox Extension"
                class="mx-1"
              >
                <v-img
                  src="img/holodex-plus/firefox-amo.png"
                  :max-height="50"
                  :max-width="145"
                  contain
                  class="rounded-lg"
                />
              </a>
              <v-btn
                class="white--text deep-purple rounded-lg mx-1"
                target="_blank"
                href="https://github.com/HolodexNet/Holodex-Plus"
                :height="50"
                title="Github Download"
              >
                <v-icon left large>
                  {{ mdiGithub }}
                </v-icon>
                Install <br> from Github
              </v-btn>
            </div>
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
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("views.extension.title")} - Holodex`;
            },
        };
    },
    data() {
        return {
            mdiGithub,
        };
    },
};
</script>

<style>

</style>
