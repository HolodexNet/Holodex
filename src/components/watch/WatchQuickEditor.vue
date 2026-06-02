<template>
  <v-card class="watch-card rounded-0 striped">
    <v-snackbar
      v-if="errorMessage"
      v-model="showErrorAlert"
      color="error"
      dismissible
    >
      {{ errorMessage }}
    </v-snackbar>
    <v-snackbar
      v-if="successMessage"
      v-model="showSuccessAlert"
      color="green"
      dismissible
      absolute
      top
      app
    >
      {{ successMessage }}
    </v-snackbar>
    <div class="d-flex justify-space-between flex-wrap align-top">
      <v-col cols="auto">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-avatar
              v-bind="attrs"
              rounded
              left
              size="40"
              v-on="on"
            >
              <v-btn icon @click.stop.prevent="applyDeleteMentions()">
                <v-icon
                  v-if="!isApplyingBulkEdit"
                  size="25"
                  color="grey darken-2"
                >
                  {{ icons.mdiContentSaveEdit }}
                </v-icon>
                <v-progress-circular
                  v-else
                  :size="25"
                  indeterminate
                />
              </v-btn>
            </v-avatar>
          </template>
          <span>Apply Changes</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-avatar
              v-bind="attrs"
              rounded
              left
              size="40"
              v-on="on"
            >
              <v-btn icon @click.stop.prevent="toggleMentionSelection()">
                <v-icon v-if="isSelectedAll" size="25" color="grey darken-2">
                  {{ icons.mdiSelectOff }}
                </v-icon>
                <v-icon v-else size="25" color="grey darken-2">
                  {{ icons.mdiSelectAll }}
                </v-icon>
              </v-btn>
            </v-avatar>
          </template>
          <span v-if="isSelectedAll">Deselect All</span>
          <span v-else>Select All</span>
        </v-tooltip>

        <!-- <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ mdiAt }}
          </v-icon>
        </v-avatar> -->

        <template v-for="item in mentions">
          <ChannelChip
            :key="item.id + 'chip'"
            :channel="item"
            :size="60"
            :close-delay="0"
          >
            <template #default>
              <v-overlay v-if="isAddedToDeletionSet(item.id)" absolute>
                <v-btn
                  icon
                  @click.stop.prevent="removeChannelFromDeletionSet(item.id)"
                >
                  <v-icon>{{ icons.mdiDelete }}</v-icon>
                </v-btn>
              </v-overlay>
              <v-overlay v-else absolute :opacity="0">
                <v-btn
                  icon
                  @click.stop.prevent="addChannelToDeletionSet(item.id)"
                >
                  <!-- <v-icon>{{ icons.mdiPinOutline }}</v-icon> -->
                </v-btn>
              </v-overlay>
            </template>
          </ChannelChip>
        </template>
        <v-autocomplete
          v-model="selectedChannel"
          :search-input.sync="inputChannel"
          :items="searchChannels"
          hide-no-data
          hide-details
          auto-select-first
          return-object
          item-value="id"
          :item-text="getChannelName"
          label="Add Mentioned Channels"
          style="min-width: 300px"
        />
      </v-col>
      <v-divider vertical />
      <v-col v-if="video.type === 'stream' || video.type === 'placeholder'" cols="auto">
        <!-- <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ icons.mdiPencil }}
          </v-icon>
        </v-avatar> -->
        <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ icons.mdiAnimationPlay }}
          </v-icon>
        </v-avatar>
        <span class="text-overline ml-3 text--disabled">{{
          $t("component.search.type.topic")
        }}</span>
        <span class="primary--text text-overline "> {{ currentTopic }} </span>
        <v-autocomplete
          ref="topicAutocomplete"
          v-model="selectedTopic"
          :search-input.sync="inputTopic"
          :items="topics"
          :filter="filterTopic"
          hide-details
          auto-select-first
          return-object
          item-value="id"
          :item-text="getTopicItemText"
          label="Topic (leave empty to unset)"
          :append-outer-icon="mdiContentSave"
          @click="loadTopics"
          @click:append-outer="saveTopic"
          @keydown.enter="onTopicEnterKeyDown"
        />
      </v-col>
    </div>
  </v-card>
</template>

<script lang="ts">
import ChannelChip from "@/components/channel/ChannelChip.vue";
import { mdiAt, mdiContentSave } from "@mdi/js";
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import debounce from "lodash-es/debounce";

export default {
    name: "WatchQuickEditor",
    components: {
        ChannelChip,
    },
    props: {
        video: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            mentions: [],
            inputChannel: "",
            searchChannels: [],
            selectedChannel: null,

            showSuccessAlert: false,
            showErrorAlert: false,
            errorMessage: "",
            successMessage: "",

            mdiAt,
            mdiContentSave,

            topics: [],
            inputTopic: "",
            selectedTopic: null,
            currentTopic: null,

            isSelectedAll: false,
            isApplyingBulkEdit: false,
            deletionSet: new Set(),
        };
    },
    computed: {
        role() {
            return this.$store.state.userdata?.user?.role;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        inputChannel: debounce(function () {
            if (!this.inputChannel) {
                this.searchChannels = [];
                return;
            }
            backendApi
                .searchChannel({
                    type: CHANNEL_TYPES.VTUBER,
                    queryText: this.inputChannel,
                })
                .then(({ data }) => {
                    this.searchChannels = data.filter(
                        (d) => !(
                            this.video.channel.id === d.id
                            || this.mentions.find((m) => m.id === d.id)
                        ),
                    );
                });
        }, 400),
        selectedChannel(channel) {
            if (channel) {
                this.inputChannel = "";
                this.searchChannels = [];
                this.selectedChannel = null;
                this.addMention(channel);
            }
        },
        selectedTopic(topic) {
            if (topic) {
                // Update input value to be topic id rather than selected dropdown item text.
                // This needs to be in a $nextTick in a watcher rather than in a @input/@change handler,
                // because such handlers (even with $nextTick) fire too early.
                // Also, not using the alternative solution of a #selection slot to display topic id for the input,
                // since that results in e.g. backspace deleting the whole input instead of a single character.
                this.$nextTick(() => {
                    this.inputTopic = topic.id;
                });
            }
        },
    },
    mounted() {
        this.updateMentions();
        this.updateCurrentTopic();
    },
    beforeDestroy() {},
    methods: {
        updateCurrentTopic() {
            backendApi.getVideoTopic(this.video.id).then(({ data }) => {
                this.currentTopic = data.topic_id;
            });
        },
        updateMentions() {
            backendApi
                .getMentions(this.video.id)
                .then(({ data }) => {
                    this.mentions = data;
                })
                .catch((e) => {
                    console.error(e);
                });
        },
        getChannelName(channel) {
            const prop = this.$store.state.settings.nameProperty;
            return channel[prop] || channel.name;
        },
        isAddedToDeletionSet(id: string) {
            return this.deletionSet.has(id);
        },
        addChannelToDeletionSet(id: string) {
            this.deletionSet.add(id);
            if (this.deletionSet.size === this.mentions.length) {
                this.isSelectedAll = true;
            }
            this.$forceUpdate();
        },
        removeChannelFromDeletionSet(id: string) {
            this.deletionSet.delete(id);
            if (this.deletionSet.size === 0) {
                this.isSelectedAll = false;
            }
            this.$forceUpdate();
        },
        toggleMentionSelection() {
            this.isSelectedAll = !this.isSelectedAll;
            if (this.isSelectedAll) {
                this.mentions.forEach((mention) => this.deletionSet.add(mention.id));
            } else {
                this.deletionSet.clear();
            }
        },
        applyDeleteMentions() {
            this.isApplyingBulkEdit = true;
            const ids = Array.from(this.deletionSet);
            if (ids.length === 0) {
                this.isApplyingBulkEdit = false;
                return;
            }

            backendApi
                .deleteMentions(this.video.id, ids, this.$store.state.userdata.jwt)
                .then(({ data }) => {
                    if (!data) return;
                    this.deletionSet.clear();
                    this.isSelectedAll = false;
                    this.showSuccess("Successfully deleted mention");
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError(
                        (e.response && e.response.data.message)
                            || e.message
                            || "Error occured",
                    );
                })
                .finally(() => {
                    this.isApplyingBulkEdit = false;
                    this.$forceUpdate();
                });
        },
        deleteMention(channel) {
            this.removeChannelFromDeletionSet(channel.id);
            backendApi
                .deleteMentions(
                    this.video.id,
                    [channel.id],
                    this.$store.state.userdata.jwt,
                )
                .then(({ data }) => {
                    if (!data) return;
                    this.showSuccess("Successfully deleted mention");
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError(
                        (e.response && e.response.data.message)
                            || e.message
                            || "Error occured",
                    );
                });
        },
        addMention(channel) {
            backendApi
                .addMention(this.video.id, channel.id, this.$store.state.userdata.jwt)
                .then(({ data }) => {
                    if (!data) return;
                    this.showSuccess(`Added channel: ${this.getChannelName(channel)}`);
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError(
                        (e.response && e.response.data.message)
                            || e.message
                            || "Error occured",
                    );
                });
        },
        showError(message) {
            this.errorMessage = message;
            this.showErrorAlert = true;
            setTimeout(() => {
                this.showErrorAlert = false;
            }, 4000);
        },
        showSuccess(message) {
            this.showSuccessAlert = true;
            this.successMessage = message;
            setTimeout(() => {
                this.showSuccessAlert = false;
            }, 4000);
        },
        async loadTopics() {
            if (this.topics.length > 0) return;
            this.topics = (await backendApi.topics()).data;
        },
        getTopicItemText(topic) {
            return `${topic.id} (${topic.count ?? 0})`;
        },
        onTopicEnterKeyDown() {
            // When dropdown menu is closed and enter key is pressed, save the topic.
            // Also suppress v-autocomplete/v-select automatically activating the menu on enter key:
            // There's no direct way to disable it and the menu activation is done after this handler is called,
            // so the workaround is to force the menu closed in a $nextTick that's flushed before rendering.
            const { topicAutocomplete } = this.$refs;
            if (!topicAutocomplete.isMenuActive) {
                this.$nextTick(() => {
                    topicAutocomplete.isMenuActive = false;
                });
                this.saveTopic();
            }
        },
        saveTopic() {
            const topicId = this.selectedTopic?.id || null;
            backendApi.topicSet(
                topicId,
                this.video.id,
                this.$store.state.userdata.jwt,
            ).then(() => {
                this.showSuccess(`Updated Topic to ${topicId}`);
            });
        },
        filterTopic(_, queryText, itemText) { // same as default filter, just also converting whitespace to underscore
            return itemText.toString().replace(/\s+/g, "_").toLocaleLowerCase()
                .indexOf(queryText.toString().replace(/\s+/g, "_").toLocaleLowerCase()) > -1;
        },
    },
};
</script>

<style>
.watch-card {
  border: none !important;
  box-shadow: none !important;
}
.uploader-data-list {
  flex-basis: auto;
  flex-direction: column;
  align-items: stretch;
  margin-right: 12px;
}
#video-edit-btn {
  font-size: 12px;
}
.theme--dark .striped {
  background: repeating-linear-gradient(
    45deg,
    #1111,
    #1111 10px,
    #1114 10px,
    #1114 20px
  );
}
.theme--light .striped {
  background: repeating-linear-gradient(
    45deg,
    #fffe,
    #fffe 10px,
    #fff1 10px,
    #fff1 20px
  );
}
</style>
