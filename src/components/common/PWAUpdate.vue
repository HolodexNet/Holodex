<template>
  <v-snackbar
    v-if="needRefresh"
    bottom
    right
    :value="needRefresh"
    :timeout="-1"
    color="primary"
  >
    {{ $t("views.app.update_available") }}
    <template #action>
      <v-btn text class="ml-auto" @click="updateServiceWorker">
        {{ $t("views.app.update_btn") }}
      </v-btn>
      <v-btn text class="ml-auto" @click="needRefresh = false">
        {{ $t("views.app.close_btn") }}
      </v-btn>
    </template>
  </v-snackbar>
  <v-snackbar
    v-else-if="showUpdateDetails"
    bottom
    center
    :value="showUpdateDetails"
    color="primary"
    :timeout="-1"
  >
    {{ $t("views.app.check_about_page") }}
    <template #action>
      <v-btn
        text
        class="ml-auto"
        to="/about#changelog"
        @click="showUpdateDetails = false"
      >
        Changelog
      </v-btn>
      <v-btn text class="ml-auto" @click="showUpdateDetails = false">
        {{ $t("views.app.close_btn") }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import * as SW from "../../sw";

export default {
    name: "PWAUpdate",
    data() {
        return {
            needRefresh: false,
        };
    },
    computed: {
        showUpdateDetails: {
            set(val) {
                this.$store.commit("setShowUpdatesDetail", val);
            },
            get() {
                return this.$store.state.showUpdateDetails;
            },
        },
    },
    created() {
        SW.setNeedsRefreshCallback(() => {
            console.log("sw needs refresh");
            this.needRefresh = true;
        });
    },
    methods: {
        async updateServiceWorker() {
            console.log("update service worker");
            await SW.updateServiceWorker();
            this.showUpdateDetails = true;
            window.location.reload();
        },
    },
};
</script>

<style>

</style>
