<template>
    <div>
        <div class="text-h6">
            <v-icon>{{ mdiAt }}</v-icon> Channel Mentions/Tags
        </div>
        <v-alert type="success" v-if="successMessage" v-model="showSuccessAlert" dismissible>
            {{ successMessage }}
        </v-alert>
        <v-alert type="error" v-if="errorMessage" v-model="showErrorAlert" dismissible>
            {{ errorMessage }}
        </v-alert>
        <div class="d-flex flex-column my-2">
            <v-autocomplete
                :search-input.sync="search"
                :items="searchResults"
                v-model="selectedChannel"
                hide-no-data
                clearable
                chips
                label="Search Channels"
            />
            <v-btn @click="addMention(selectedChannel.id)">Add</v-btn>
        </div>
        <channel-list :channels="mentions" :includeVideoCount="false">
            <template v-slot:action="{ channel }">
                <v-btn icon color="red" @click.stop.prevent="deleteMention(channel.id)">
                    <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
            </template>
        </channel-list>
        <!-- <loading-overlay :isLoading="isLoading" :showError="hasError" /> -->
    </div>
</template>

<script>
import { mdiDelete, mdiAt } from "@mdi/js";
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import { debounce } from "@/utils/functions";
import ChannelList from "../channel/ChannelList.vue";
import LoadingOverlay from "../common/LoadingOverlay.vue";

export default {
    name: "VideoEditMentions",
    components: { ChannelList, LoadingOverlay },
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
            mdiDelete,
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
                    this.searchResults = data.map((d) => {
                        return {
                            text: this.getChannelName(d),
                            value: d,
                            disabled: this.video.channel.id === d.id || this.mentions.find((m) => m.id === d.id),
                        };
                    });
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
