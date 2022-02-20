<template>
  <div>
    <slot />
    <v-autocomplete
      v-model="ignoredTopics"
      :items="topics"
      multiple
      chips
      clearable
      deletable-chips
      :label="$t('views.settings.ignoredTopicsLabel')"
      :hint="$t('views.settings.ignoredTopicsMsg')"
      persistent-hint
      hide-details
    />
    <v-switch
      v-model="hideCollabStreams"
      class="v-input--reverse v-input--expand"
      inset
      :label="$t('views.settings.hideCollabStreamsLabel')"
      :messages="$t('views.settings.hideCollabStreamsMsg')"
      hide-details
    />
    <v-switch
      v-model="hidePlaceholder"
      class="v-input--reverse v-input--expand"
      inset
      label="hidePlaceholder"
      :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      hide-details
    />
    <v-switch
      v-model="hideThumbnail"
      class="v-input--reverse v-input--expand"
      inset
      :label="$t('views.settings.hideVideoThumbnailsLabel')"
      :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      hide-details
    />
  </div>
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