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
      :loading="topicsLoading"
      @focus="fetchTopics"
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
      :label="$t('views.settings.hidePlaceholderStreams')"
      :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      hide-details
    />
    <!-- <v-switch
      v-model="hideThumbnail"
      class="v-input--reverse v-input--expand"
      inset
      :label="$t('views.settings.hideVideoThumbnailsLabel')"
      :messages="$t('views.settings.hideVideoThumbnailsMsg')"
      hide-details
    /> -->
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
            topicsLoading: false,
        };
    },
    computed: {
        ...syncState("settings", [
            "hideCollabStreams",
            "ignoredTopics",
            // "hideThumbnail",
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
    methods: {
        async fetchTopics() {
            if (!this.topics.length) {
                this.topicsLoading = true;
                const { data } = await backendApi.topics();
                this.topics = data.map(({ id, count }) => ({ value: id, text: `${id} (${count})` }));
                this.topicsLoading = false;
            }
        },
    },
};
</script>

<style>

</style>
