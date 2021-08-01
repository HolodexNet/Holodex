<template>
  <div>
    <div class="text-h6">
      <v-icon>{{ mdiAt }}</v-icon> Channel Mentions/Tags
    </div>
    <v-snackbar
      v-if="successMessage"
      v-model="showSuccessAlert"
      color="success"
      dismissible
    >
      {{ successMessage }}
    </v-snackbar>
    <v-snackbar
      v-if="errorMessage"
      v-model="showErrorAlert"
      color="error"
      dismissible
    >
      {{ errorMessage }}
    </v-snackbar>
    <div class="d-flex flex-column my-2">
      <v-autocomplete
        v-model="selectedChannel"
        :search-input.sync="search"
        :items="searchResults"
        hide-no-data
        clearable
        chips
        label="Search Channels"
      />
      <v-btn @click="addMention(selectedChannel.id)">
        Add
      </v-btn>
    </div>
    <channel-list :channels="mentions" :include-video-count="false">
      <template #action="{ channel }">
        <v-btn
          class="deleteBtn"
          icon
          x-large
          color="red"
          @click.stop.prevent="deleteMention(channel.id)"
        >
          <v-icon large>
            {{ icons.mdiDelete }}
          </v-icon>
        </v-btn>
      </template>
    </channel-list>
    <!-- <loading-overlay :isLoading="isLoading" :showError="hasError" /> -->
  </div>
</template>

<script>
import { mdiAt } from "@mdi/js";
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import { debounce } from "@/utils/functions";
import ChannelList from "../channel/ChannelList.vue";

export default {
    name: "VideoEditMentions",
    components: { ChannelList },
    props: {
        video: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            mentions: [],
            isLoading: true,
            hasError: false,
            showSuccessAlert: false,
            showErrorAlert: false,
            errorMessage: "",
            successMessage: "",
            mdiAt,

            selectedChannel: null,
            search: "",
            searchResults: [],
        };
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
                    this.searchResults = data.map((d) => ({
                        text: this.getChannelName(d),
                        value: d,
                        disabled: this.video.channel.id === d.id || this.mentions.find((m) => m.id === d.id),
                    }));
                });
        }, 200),
    },
    mounted() {
        this.updateMentions();
    },
    methods: {
        updateMentions() {
            backendApi
                .getMentions(this.video.id)
                .then(({ data }) => {
                    // this.isLoading = false;
                    this.mentions = data;
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
        showSuccess(message) {
            this.showSuccessAlert = true;
            this.successMessage = message;
            setTimeout(() => {
                this.showSuccessAlert = false;
            }, 4000);
        },
        showError(message) {
            this.errorMessage = message;
            this.showErrorAlert = true;
            setTimeout(() => {
                this.showErrorAlert = false;
            }, 4000);
        },
        deleteMention(channelId) {
            backendApi
                .deleteMentions(this.video.id, [channelId], this.$store.state.userdata.jwt)
                .then(({ data }) => {
                    if (!data) return;
                    this.showSuccess("Successfully deleted mention");
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError((e.response && e.response.data.message) || e.message || "Error occured");
                });
        },
        addMention(channelId) {
            this.isLoading = true;
            backendApi
                .addMention(this.video.id, channelId, this.$store.state.userdata.jwt)
                .then(({ data }) => {
                    if (!data) return;
                    this.showSuccess(`Added channel: ${this.getChannelName(this.selectedChannel)}`);
                    this.updateMentions();
                })
                .catch((e) => {
                    this.showError((e.response && e.response.data.message) || e.message || "Error occured");
                });
        },
    },
};
</script>

<style></style>
