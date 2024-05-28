<template>
  <div>
    <v-dialog v-model="showReportDialog" width="500">
      <v-card v-if="video">
        <v-card-title class="headline">
          {{ $t("component.reportDialog.title") }}
        </v-card-title>
        <v-card-text :v-if="!isLoading">
          <v-alert
            v-model="error"
            dense
            text
            type="error"
            dismissible
          >
            Error Occurred
          </v-alert>
          <v-alert v-if="isCollab" type="info">
            {{ $t("component.reportDialog.collabing", {org: $store.state.currentOrg.name }) }}
          </v-alert>
          <span class="text-body-1">{{ video.title }}</span>
          <br>
          {{ video.channel.name }}
          <br>
          <v-checkbox
            v-for="reason in filteredReasons()"
            :key="reason.value"
            v-model="selectedReasons"
            :label="reason.text"
            :value="reason.value"
            hide-details="true"
            class="shrink mt-2"
            @click="reason.value.includes('mention') && suggestedMentions === null ? loadMentions() : null"
          />
          <br>
          <span v-if="selectedReasons.includes('Incorrect video topic')">
            <span class="text-overline text--disabled">{{
              $t("component.search.type.topic")
            }}</span>
            <span class="primary--text text-overline "> {{ video.topic_id || "None" }} </span>
            <v-autocomplete
              v-model="suggestedTopic"
              :items="topics"
              inline
              hide-details
              label="Suggest new topic (leave empty to unset)"
              @click="loadTopics"
            />
            <br>
          </span>
          <span v-if="selectedReasons.includes('Incorrect channel mentions')">
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
            <template v-for="item in suggestedMentions">
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
              v-model="suggestedMentions"
              :search-input.sync="search"
              :items="searchResults"
              hide-no-data
              multiple
              hide-details
              :rules="[]"
              return-object
              item-value="id"
              label="Adjust Mentioned Channels"
              no-filter
              style="min-width: 300px"
            >
              <template #selection="selection">
                <ChannelChip
                  :key="selection.item.id + 'chip'"
                  :channel="selection.item"
                  :size="40"
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
            <br>
          </span>
          <span
            v-if="selectedReasons.includes('This video does not belong to the org')
              && !collabsAlreadyHidden
              && video.type !== 'clip'"
          >
            <span class="secondary--text"> {{ $t('component.reportDialog.consider') }} </span>
            <VideoListFilters :placeholder-filter="false" :topic-filter="false" :missing-filter="false" />
            <br>
          </span>
          <v-card-text v-if="video.channel.id === 'UCF4-I8ZQL6Aa-iHfdz-B9KQ'" class="red--text">
            <b>Note: Please don't report just because you disagree / dislike this subber.</b>
            <div v-if="readMore">
              <p>
                Holodex platform doesn't arbitrate between sub-par and good TLs. For minor issues, you
                should feedback changes to the subber on youtube via comments, or else reporting them to
                whoever they're clipping (Cover or Nijisanji etc.).
              </p>
              <p>
                However, if the video in question is indeed dangerously translated to cause
                misunderstandings, we will definitely either delete the video or deplatform the channel,
                in addition to escalating to relevant organizations.
              </p>
              <p>
                If you'd like to not see this channel ever again, there's a
                <b>Block Channel</b> button below, and on the channel page.
              </p>
            </div>
            <a v-else @click.stop="readMore = true"> Read more...</a>
          </v-card-text>
          <v-textarea
            v-model="comments"
            filled
            :label="$t('component.reportDialog.comments')"
            persistent-hint
            hint="* English / 日本語 / 繁體中文 OK"
            :error="!comments.length"
          />
        </v-card-text>

        <v-divider />
        <channel-socials
          :channel="video.channel"
          show-delete
          hide-yt
          vertical
          class="d-inline-block ml-4"
        />
        <v-icon small class="ml-1">
          {{ icons.mdiArrowLeft }}
        </v-icon>
        {{ $t("component.channelSocials.block") }}
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showReportDialog = false">
            {{ $t("views.app.close_btn") }}
          </v-btn>
          <v-btn color="primary" :disabled="comments.length === 0" @click="sendReport">
            {{ $t("views.multiview.confirmOverwriteYes") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="showSnackbar" :timeout="3000" color="success">
      {{ $t("component.reportDialog.success") }}
      <template #action>
        <v-btn text class="ml-auto" @click="showSnackbar = false">
          {{ $t("views.app.close_btn") }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import backendApi from "@/utils/backend-api";
import ChannelChip from "@/components/channel/ChannelChip.vue";
import ChannelSocials from "@/components/channel/ChannelSocials.vue";
import filterVideos from "@/mixins/filterVideos";
import debounce from "lodash-es/debounce";
import { CHANNEL_TYPES } from "@/utils/consts";
import VideoListFilters from "@/components/setting/VideoListFilters.vue";

export default {
    name: "ReportDialog",
    components: { ChannelSocials, ChannelChip, VideoListFilters },
    mixins: [filterVideos],
    data() {
        return {
            selectedReason: "Incorrect video topic",
            selectedReasons: [],
            comments: "",
            isLoading: false,
            showSnackbar: false,
            error: false,
            readMore: false,
            topics: [],
            suggestedTopic: false,
            search: "",
            searchResults: [],
            originalMentions: [],
            suggestedMentions: null,
            deletionSet: new Set(),
            isSelectedAll: false,
            isApplyingBulkEdit: false,
            collabsAlreadyHidden: this.$store.state.settings.hideCollabStreams,
        };
    },
    computed: {
        reasons() {
            const vtype = this.video.type === "stream" ? "video" : this.video.type;
            return [
                {
                    text: this.$t("component.reportDialog.reasons[4]"),
                    value: "Incorrect video topic",
                    types: ["stream", "placeholder"],
                    orgRequired: false,
                },
                {
                    text: this.$t("component.reportDialog.reasons[5]"),
                    value: "Incorrect channel mentions",
                    types: null,
                    orgRequired: false,
                },
                {
                    text: this.$t("component.reportDialog.reasons[6]", [vtype, this.currentOrg.name]),
                    value: "This video does not belong to the org",
                    types: null,
                    orgRequired: true,
                },
                {
                    text: this.$t("component.reportDialog.reasons[1]"),
                    value: "Low Quality/Misleading Content",
                    types: ["clip"],
                    orgRequired: false,
                },
                {
                    text: this.$t("component.reportDialog.reasons[2]"),
                    value: "Violates the org's derivative work guidelines or inappropriate",
                    types: ["clip"],
                    orgRequired: false,
                },
                {
                    text: this.$t("component.reportDialog.reasons[3]"),
                    value: "Other",
                    types: null,
                    orgRequired: false,
                },
            ];
        },
        video() {
            return this.$store.state.reportVideo;
        },
        isCollab() {
            return !this.filterVideos(this.video, { hideCollabs: true });
        },
        user() {
            return this.$store.state.userdata.user;
        },
        currentOrg() {
            return this.$store.state.currentOrg;
        },
        showReportDialog: {
            get() {
                return this.$store.state.reportVideo;
            },
            set(val) {
                if (!val) this.$store.commit("setReportVideo", null);
                this.suggestedTopic = false;
                this.suggestedMentions = null;
                this.search = "";
                this.searchResults = [];
                this.selectedReasons = [];
            },
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
                            || this.suggestedMentions?.find((m) => m.id === d.id)
                        ),
                    );
                });
        }, 400),
    },
    methods: {
        sendReport() {
            this.isLoading = true;
            const commentField = {
                name: "Comments",
                value: this.comments ? this.comments : "No comment",
            };
            const reasonString = this.selectedReasons.join("\n");
            const thisTopic = this.video.topic_id;
            const fieldBody = [
                {
                    name: "Reason",
                    value: reasonString,
                },
            ];
            if (this.suggestedTopic !== false || reasonString.includes("topic")) {
                fieldBody.push(
                    {
                        name: "Original Topic",
                        value: thisTopic ? `\`${thisTopic}\`` : "None",
                    },
                );
                if (thisTopic !== this.suggestedTopic) {
                    fieldBody.push(
                        {
                            name: "Suggested Topic",
                            value: this.suggestedTopic ? `\`${this.suggestedTopic}\`` : "None",
                        },
                    );
                }
            }
            if (this.suggestedMentions !== null || reasonString.includes("mentions")) {
                fieldBody.push(
                    {
                        name: "Original Mentions",
                        value: this.originalMentions && this.originalMentions.length > 0 ? this.originalMentions.map((m) => `\`${m.id}\``).join("\n") || "None" : "None",
                    },
                );
                if (this.suggestedMentions !== null && this.suggestedMentions !== this.originalMentions) {
                    fieldBody.push(
                        {
                            name: "Suggested Mentions",
                            value: this.suggestedMentions && this.suggestedMentions.length > 0 ? this.suggestedMentions.map((m) => `\`${m.id}\``).join("\n") || "None" : "None",
                        },
                    );
                }
            }
            fieldBody.push(commentField);
            backendApi.reportVideo(this.video.id, fieldBody, this.$store.state.userdata?.jwt)
                .then(() => {
                    this.showReportDialog = false;
                    this.showSnackbar = true;
                    this.error = false;
                })
                .catch((e) => {
                    console.error(e);
                    this.error = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        getChannelName(channel) {
            const prop = this.$store.state.settings.nameProperty;
            return channel[prop] || channel.name;
        },
        isAddedToDeletionSet(id) {
            return this.deletionSet.has(id);
        },
        addChannelToDeletionSet(id) {
            this.deletionSet.add(id);
            if (this.deletionSet.size === this.suggestedMentions.length) {
                this.isSelectedAll = true;
            }
            this.$forceUpdate();
        },
        removeChannelFromDeletionSet(id) {
            this.deletionSet.delete(id);
            if (this.deletionSet.size === 0) {
                this.isSelectedAll = false;
            }
            this.$forceUpdate();
        },
        toggleMentionSelection() {
            this.isSelectedAll = !this.isSelectedAll;
            if (this.isSelectedAll) {
                this.suggestedMentions.forEach((mention) => this.deletionSet.add(mention.id));
            } else {
                this.deletionSet.clear();
            }
        },
        loadMentions() {
            if (this.suggestedMentions !== null) {
                return this.originalMentions;
            }
            backendApi
                .getMentions(this.video.id)
                .then(({ data }) => {
                    // this.isLoading = false;
                    this.originalMentions = data;
                    this.updateMentions(data);
                })
                .catch((e) => {
                    console.error(e);
                    // this.hasError = true;
                });
            return this.originalMentions;
        },
        async loadTopics() {
            if (this.topics.length > 0) return;
            this.topics = (await backendApi.topics()).data.map((topic) => ({
                value: topic.id,
                text: `${topic.id} (${topic.count ?? 0})`,
            }));
        },
        filteredReasons() {
            return this.reasons.filter((reason) => {
                if (reason.orgRequired && ((!this.currentOrg || this.currentOrg.name === "All Vtubers" || this.currentOrg.name === this.video.channel.org) || this.$route.name !== "home")) return false;
                if (reason.types && !reason.types.includes(this.video.type)) return false;
                return true;
            });
        },
        updateMentions(data = null) {
            if (data) {
                this.suggestedMentions = data;
            }
            this.searchResults = [];
            this.search = "";
        },
        deleteMention(channel) {
            this.removeChannelFromDeletionSet(channel.id);
            this.suggestedMentions = this.suggestedMentions.filter((mention) => mention.id !== channel.id);
            this.updateMentions();
        },
        addMention(channel) {
            if (!this.suggestedMentions.includes(channel)) {
                this.suggestedMentions.push(channel);
            }
            this.updateMentions();
        },
        applyDeleteMentions() {
            this.isApplyingBulkEdit = true;
            const ids = Array.from(this.deletionSet);
            if (ids.length === 0) {
                this.isApplyingBulkEdit = false;
                return;
            }
            this.suggestedMentions = this.suggestedMentions.filter((mention) => !ids.includes(mention.id));
            this.deletionSet.clear();
            this.isSelectedAll = false;
            this.updateMentions();
            this.isApplyingBulkEdit = false;
            this.$forceUpdate();
        },
    },
};
</script>

<style></style>
