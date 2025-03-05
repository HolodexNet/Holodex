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
          v-model="fake"
          :search-input.sync="search"
          :items="searchResults"
          hide-no-data
          multiple
          hide-details
          :rules="[]"
          return-object
          item-value="id"
          label="Add Mentioned Channels"
          no-filter
          style="min-width: 300px"
        >
          <template #selection="selection">
            <ChannelChip
              :key="selection.item.id + 'chip'"
              :channel="selection.item"
              :size="60"
            >
              <v-btn icon @click.stop.prevent="deleteMention(selection.item)">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </ChannelChip>
          </template>
          <template #item="dropdownItem">
            <v-list-item-content
              class="py-1 pt-1"
              @click.stop="addMention(dropdownItem.item)"
            >
              <v-list-item-subtitle class="text--primary">
                {{ getChannelName(dropdownItem.item) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
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
          v-model="newTopic"
          :items="topics"
          :filter="topicFilter"
          inline
          hide-details
          label="Topic (leave empty to unset)"
          :append-outer-icon="mdiContentSave"
          @click="loadTopics"
          @click:append-outer="saveTopic"
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
            search: "",
            searchResults: [],
            fake: [],

            hasError: false,
            showSuccessAlert: false,
            showErrorAlert: false,
            errorMessage: "",
            successMessage: "",

            mdiAt,
            mdiContentSave,

            topics: [],
            newTopic: null,
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
        search: debounce(function () {
            if (!this.search) {
                this.searchResults = [];
                return;
            }
            backendApi
                .searchChannel({
                    type: CHANNEL_TYPES.VTUBER,
                    queryText: this.search,
                })
                .then(({ data }) => {
                    this.searchResults = data.filter(
                        (d) => !(
                            this.video.channel.id === d.id
                            || this.mentions.find((m) => m.id === d.id)
                        ),
                    );
                });
        }, 400),
        fake(nv: [any] | null) {
            if (nv && nv.length && nv.length > 0) {
                this.addMention(nv[0]);
                this.fake = null;
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
                    // this.isLoading = false;
                    this.mentions = data;
                    this.searchResults = [];
                    this.search = "";
                })
                .catch((e) => {
                    console.error(e);
                    // this.hasError = true;
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
            this.isLoading = true;
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
            this.topics = (await backendApi.topics()).data.map((topic) => ({
                value: topic.id,
                text: `${topic.id} (${topic.count ?? 0})`,
            }));
        },
        saveTopic() {
            backendApi.topicSet(
                this.newTopic,
                this.video.id,
                this.$store.state.userdata.jwt,
            ).then(() => {
                this.showSuccess(`Updated Topic to ${this.newTopic}`);
            });
            this.topic = this.newTopic;
        },
        topicFilter(_, queryText, itemText) { // same as default filter, just also converting whitespace to underscore
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
