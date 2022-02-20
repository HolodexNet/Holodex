<template>
  <v-sheet class="settings-group">
    <!-- <v-card-title class="py-1">
        <v-icon
          large
          disabled
          left
          class="ml-n3"
        >
          {{ mdiFilterOutline }}
        </v-icon>
        <span class="text-h6 font-weight-light">{{ $t("views.settings.videoFeedSettings") }}</span>
      </v-card-title> -->
    <v-card-text>
      <v-switch
        v-model="hideCollabStreams"
        :prepend-icon="mdiEyeOff"
        class="v-input--reverse v-input--expand mt-0"
        inset
        :label="$t('views.settings.hideCollabStreamsLabel')"
        :messages="$t('views.settings.hideCollabStreamsMsg')"
      />

      <v-autocomplete
        v-model="ignoredTopics"
        :items="topics"
        prepend-icon=" "
        multiple
        chips
        clearable
        deletable-chips
        :label="$t('views.settings.ignoredTopicsLabel')"
        :hint="$t('views.settings.ignoredTopicsMsg')"
        persistent-hint
      />

      <v-switch
        v-model="hideThumbnail"
        prepend-icon=" "
        class="v-input--reverse v-input--expand"
        inset
        :label="$t('views.settings.hideVideoThumbnailsLabel')"
        :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      />

      <v-switch
        v-model="hidePlaceholder"
        prepend-icon=" "
        class="v-input--reverse v-input--expand"
        inset
        label="hidePlaceholder"
        :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      />
    </v-card-text>
  </v-sheet>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import {
    mdiFilterOutline,
    mdiEyeOff,
} from "@mdi/js";
import { syncState } from "@/utils/functions";

export default {
    name: "VideoListFilters",
    data() {
        return {
            mdiFilterOutline,
            mdiEyeOff,
            topics: [],
        };
    },
    computed: {
        ...syncState("settings", [
            "hideCollabStreams",
            "ignoredTopics",
            "hideThumbnail",
            "hidePlaceholder",
        ]),
        ignoredTopics: {
            get() {
                return this.$store.state.settings.ignoredTopics;
            },
            set(val: any[]) {
                this.$store.commit("settings/setIgnoredTopics", val.sort());
            },
        },
    },
    async mounted() {
        backendApi.topics().then(({ data }) => {
            this.topics = data.map(({ id, count }) => ({ value: id, text: `${id} (${count})` }));
        });
    },
};
</script>

<style>

</style>
