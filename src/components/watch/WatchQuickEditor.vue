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
      color="success"
      dismissible
    >
      {{ successMessage }}
    </v-snackbar>
    <div class="d-flex justify-space-between flex-wrap align-center">
      <v-col cols="auto">
        <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ icons.mdiPencil }}
          </v-icon>
        </v-avatar>
        <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ mdiAt }}
          </v-icon>
        </v-avatar>
        <template v-for="item in mentions">
          <ChannelChip :key="item.id + 'chip'" :channel="item" :size="60">
            <template #default>
              <v-overlay absolute>
                <v-btn icon @click.stop.prevent="deleteMention(item)">
                  <v-icon>{{ icons.mdiClose }}</v-icon>
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
          chips
          hide-details="auto"
          :rules="[]"
          return-object
          item-value="id"
          label="Add Mentioned Channels"
          no-filter
          style="min-width: 300px"
        >
          <template #selection="selection">
            <ChannelChip :key="selection.item.id + 'chip'" :channel="selection.item" :size="60">
              <v-btn icon @click.stop.prevent="deleteMention(selection.item)">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </ChannelChip>
          </template>
          <template #item="dropdownItem">
            <v-list-item-content class="py-1 pt-1" @click.stop="addMention(dropdownItem.item)">
              <v-list-item-subtitle class="text--primary">
                {{ getChannelName(dropdownItem.item) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
      <v-divider vertical />
      <v-col v-if="video.type === 'stream'" cols="auto">
        <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ icons.mdiPencil }}
          </v-icon>
        </v-avatar>
        <v-avatar rounded left size="40">
          <v-icon size="25" color="grey darken-2">
            {{ icons.mdiAnimationPlay }}
          </v-icon>
        </v-avatar>
        <span class="text-overline ml-3 text--disabled">{{ $t("component.search.type.topic") }}</span>
        <v-autocomplete
          v-model="newTopic"
          :items="topics"
          inline
          label="Topic (leave empty to unset)"
          :append-outer-icon="mdiContentSave"
          @click="loadTopics"
          @click:append-outer="saveTopic"
        />
        <!-- <v-avatar rounded left size="40" v-if="channelChips && channelChips.length > 0">
                    <v-icon size="25" color="grey darken-2">{{ mdiAt }}</v-icon>
                </v-avatar>
                <template v-for="mention in channelChips">
                    <ChannelChip :channel="mention" :key="mention.id" :size="60" />
                </template>
                <a
                    @click="showAllMentions = !showAllMentions"
                    style="white-space: pre"
                    class="text-subtitle-2"
                    v-if="mentions.length > 3"
                >
                    [ {{ showAllMentions ? "-" : "+" }} {{ mentions.length - 3 }} ]
                </a> -->
      </v-col>
    </div>
  </v-card>
</template>

<script lang="ts">
import ChannelChip from "@/components/channel/ChannelChip.vue";
import { mdiAt, mdiContentSave } from "@mdi/js";
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import { debounce } from "lodash";

export default {
    name: "WatchQuickEditor",
    components: {
        ChannelChip,
        // ChannelInfo,
        // ChannelSocials,
        // ChannelImg,
        // TruncatedText,
        // VideoSongs,
        // VideoDescription,
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
            newTopic: "",
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
                        (d) => !(this.video.channel.id === d.id || this.mentions.find((m) => m.id === d.id)),
                    );
                });
        }, { wait: 400 }),
    },
    mounted() {
        this.updateMentions();
    },
    beforeDestroy() {},
    methods: {
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
        deleteMention(channel) {
            backendApi
                .deleteMentions(this.video.id, [channel.id], this.$store.state.userdata.jwt)
                .then(({ data }) => {
                    if (!data) return;
                    this.showSuccess("Successfully deleted mention");
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError((e.response && e.response.data.message) || e.message || "Error occured");
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
                    this.showError((e.response && e.response.data.message) || e.message || "Error occured");
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
            backendApi.topicSet(this.newTopic, this.video.id, this.$store.state.userdata.jwt);
            this.topic = this.newTopic;
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
    background: repeating-linear-gradient(45deg, #1111, #1111 10px, #1114 10px, #1114 20px);
}
.theme--light .striped {
    background: repeating-linear-gradient(45deg, #fffe, #fffe 10px, #fff1 10px, #fff1 20px);
}
</style>
