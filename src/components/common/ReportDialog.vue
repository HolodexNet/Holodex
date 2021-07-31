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
                        Error Occured
                    </v-alert>
                    <span class="text-body-1">{{ video.title }}</span>
                    <br>
                    {{ video.channel.name }}
                    <br>
                    <v-radio-group v-model="selectedReason">
                        <v-radio
                            v-for="reason in reasons"
                            :key="reason.value"
                            :label="reason.text"
                            :value="reason.value"
                        />
                    </v-radio-group>
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
import { axiosInstance } from "@/utils/backend-api";
import ChannelSocials from "@/components/channel/ChannelSocials.vue";

export default {
    name: "ReportDialog",
    components: { ChannelSocials },
    data() {
        return {
            selectedReason: "Video tagged incorrectly",
            comments: "",
            isLoading: false,
            showSnackbar: false,
            error: false,
            readMore: false,
        };
    },
    computed: {
        reasons() {
            return [
                {
                    text: this.$t("component.reportDialog.reasons[0]"),
                    value: "Video tagged incorrectly",
                },
                {
                    text: this.$t("component.reportDialog.reasons[1]"),
                    value: "Low Quality/Misleading Content",
                },
                {
                    text: this.$t("component.reportDialog.reasons[2]"),
                    value: "Violates the org's derivative work guidelines or inappropriate",
                },
                {
                    text: this.$t("component.reportDialog.reasons[3]"),
                    value: "Other",
                },
            ];
        },
        video() {
            return this.$store.state.reportVideo;
        },
        user() {
            return this.$store.state.userdata.user;
        },
        showReportDialog: {
            get() {
                return this.$store.state.reportVideo;
            },
            set(val) {
                if (!val) this.$store.commit("setReportVideo", null);
            },
        },
    },
    methods: {
        sendReport() {
            if (this.selectedReason === "Other" && !this.comments.length) {
                this.error = true;
                return;
            }
            this.isLoading = true;
            axiosInstance
                .post(
                    "https://discord.com/api/webhooks/870849393849413692/jdIbF5gwoJCI9r2xLgs5iU0oZ0-e0UCFMuSjr5MlaU2_R_P-4LYpl9fKNQTISPxx8JHZ",
                    {
                        content: "Look what the dog dragged in...",
                        embeds: [
                            {
                                title: "Video Report",
                                color: 13840175,
                                ...(this.user && {
                                    author: {
                                        name: this.user.username,
                                    },
                                }),
                                fields: [
                                    {
                                        name: "Reason",
                                        value: this.selectedReason,
                                    },
                                    {
                                        name: "Comments",
                                        value: this.comments ? this.comments : "No comment",
                                    },
                                    {
                                        name: "Video Title",
                                        value: this.video.title,
                                    },
                                    {
                                        name: "Channel",
                                        value: this.video.channel.name,
                                    },
                                    {
                                        name: "Link",
                                        value: `https://holodex.net/watch/${this.video.id}`,
                                    },
                                ],
                            },
                        ],
                    },
                )
                .then(() => {
                    this.showReportDialog = false;
                    this.showSnackbar = true;
                    this.erorr = false;
                })
                .catch((e) => {
                    console.error(e);
                    this.error = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<style></style>
