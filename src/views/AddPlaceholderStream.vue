<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-container>
      <v-row>
        <v-col md="3" sm="8" cols="10">
          <video-card
            :video="videoObj"
            include-channel
          />
        </v-col>

        <v-col md="9" cols="12">
          <v-alert
            v-if="!isEditor && (token && !expired)"
            class="mb-2 pa-2"
            type="info"
            text
          >
            Editing as {{ token.user }} from {{ discordCredits ? discordCredits.data.guild.name : '' }} Discord
            <br>
            Your session expires: {{ expiresIn }}. Please refresh if it is about to expire
          </v-alert>
          <v-alert
            v-else-if="!isEditor"
            type="error"
            text
          >
            You are not an editor or token has expired, please login or generate a new token using our bot
          </v-alert>
          <v-card>
            <v-card-text>
              <v-text-field
                v-if="isEditor"
                v-model="creditName"
                label="Editor Credit Name"
                :rules="[requiredRule]"
                hint="Use a different name when being publicly credited"
              />
              <v-tabs v-model="tab" icons-and-text class="mb-4">
                <v-tab>New <v-icon>{{ icons.mdiPlusBox }}</v-icon></v-tab>
                <v-tab>Existing <v-icon>{{ icons.mdiPencil }}</v-icon></v-tab>
              </v-tabs>

              <v-slide-y-transition group>
                <v-text-field
                  v-if="tab === 1"
                  key="x921a"
                  v-model="id"
                  label="Placeholder ID (11 characters)"
                  :append-outer-icon="icons.mdiCheck"
                  clearable
                  @click:append-outer="loadExistingPlaceholder(id)"
                />

                <video-selector
                  v-if="tab === 1 && !id"
                  key="x921b"
                  :hide-placeholders="false"
                  @videoClicked="(video) => {id = video.id; loadExistingPlaceholder(id)}"
                />
              </v-slide-y-transition>
              <channel-autocomplete
                v-model="channel"
                label="Channel"
              />
              <v-text-field
                v-model="videoTitle"
                label="Video Title"
                :rules="[requiredRule]"
                required
              />
              <v-text-field
                v-model="videoTitleJP"
                label="Japanese Video Title"
              />
              <v-text-field
                v-model="sourceUrl"
                label="Source Link"
                hint="eg. URL to twitter schedule or twitch channel"
                placeholder="https://twitter.com/..."
                type="url"
                required
                :rules="[requiredRule, linkRule]"
              />
              <v-text-field
                v-model="thumbnail"
                label="Thumbnail Image"
                placeholder="https://imgur.com/..."
                type="url"
                :rules="[linkRule]"
              />
              <v-row class="my-n2 py-0">
                <v-col>
                  <v-select
                    v-model="placeholderType"
                    :items="PLACEHOLDER_TYPES"
                    label="Event Type"
                    required
                    :rules="[requiredRule]"
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-model="certainty"
                    :items="CERTAINTY_CHOICE"
                    label="Certainty"
                    required
                    :rules="[requiredRule]"
                  />
                </v-col>
              </v-row>
              <v-row class="mt-n3 py-0">
                <v-col>
                  <v-select
                    v-model="timezone"
                    :items="TIMEZONES"
                    label="Timezone"
                    required
                    :rules="[requiredRule, timeRule]"
                  />
                </v-col>
                <v-col>
                  <v-menu
                    v-model="showDatePicker"
                    :close-on-content-click="false"
                    offset-y
                    min-width="auto"
                  >
                    <template #activator="{ on, attrs }">
                      <v-text-field
                        v-model="liveDate"
                        label="Date"
                        v-bind="attrs"
                        :rules="[requiredRule, timeRule]"
                        hint="YYYY-MM-DD"
                        :append-icon="icons.mdiPlusBox"
                        :prepend-inner-icon="mdiMinusBox"
                        @click:append="changeDate(1, 'day')"
                        @click:prepend-inner="changeDate(-1, 'day')"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker v-model="liveDate" />
                  </v-menu>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="liveTime"
                    label="Time"
                    type="time"
                    required
                    :rules="[requiredRule, timeRule]"
                    :append-icon="icons.mdiPlusBox"
                    :prepend-inner-icon="mdiMinusBox"
                    @click:append="changeDate(1, 'hour')"
                    @click:prepend-inner="changeDate(-1, 'hour')"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="duration"
                    hint="Guess a duration in minutes"
                    label="Duration"
                    type="number"
                    suffix="minutes"
                    required
                    :rules="[requiredRule]"
                  />
                </v-col>
              </v-row>
              <v-btn
                color="primary"
                @click="onSubmit"
              >
                {{ id ? 'Submit Placeholder Modification' : 'Create new Placeholder' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="error"
      color="error"
    >
      {{ errorMessage }}
    </v-snackbar>
    <v-snackbar
      v-model="success"
      timeout="2000"
      color="success"
    >
      Successfully added Placeholder Stream
    </v-snackbar>
  </v-form>
</template>

<script lang="ts">
import ChannelAutocomplete from "@/components/channel/ChannelAutocomplete.vue";
import { dayjs } from "@/utils/time";
import VideoCard from "@/components/video/VideoCard.vue";
import jwtDecode from "jwt-decode";
import backendApi from "@/utils/backend-api";
import { mdiMinusBox } from "@mdi/js";
import VideoSelector from "@/components/multiview/VideoSelector.vue";

export default {
    components: {
        ChannelAutocomplete,
        VideoCard,
        VideoSelector,
    },
    data() {
        return {
            mdiMinusBox,

            tab: 0,
            id: "",
            valid: false,
            channel: null,
            videoTitle: "",
            videoTitleJP: "",
            creditName: this.$store.state.userdata?.user?.username,
            sourceUrl: "",
            thumbnail: "",
            placeholderType: null,
            certainty: "",
            liveDate: dayjs().format("YYYY-MM-DD"),
            liveTime: "",
            timezone: "Asia/Tokyo",
            duration: 60,
            PLACEHOLDER_TYPES: [
                {
                    text: "Scheduled YT Stream",
                    value: "scheduled-yt-stream",
                },
                {
                    text: "External Stream (eg. Twitch/Twitcast)",
                    value: "external-stream",
                },
                {
                    text: "Event",
                    value: "event",
                },
            ],
            CERTAINTY_CHOICE: [
                {
                    text: "Certain",
                    value: "certain",
                },
                {
                    text: "Likely",
                    value: "likely",
                },
            ],
            TIMEZONES: [
                {
                    text: "JST",
                    value: "Asia/Tokyo",
                },
                {
                    text: "PST",
                    value: "America/Los_Angeles",
                },
                {
                    text: "GMT",
                    value: "Etc/GMT",
                },
            ],
            showDatePicker: false,
            discordCredits: null,
            requiredRule: (v) => !!v || "Required",
            linkRule: (v) => !!v.match(/^https?:\/\/[\w-]+(\.[\w-]+)+\.?(\/\S*)?/) || "Invalid url",
            timeRule: () => !!this.availableAt || "Invalid time",

            error: false,
            errorMessage: "",
            success: false,
        };
    },
    computed: {
        isEditor() {
            const role = this.$store.state.userdata?.user?.role;
            return ["editor", "admin"].includes(role);
        },
        token() {
            const jwt = this.$route.query?.token;
            if (!jwt) return null;
            const decode = jwtDecode(jwt);
            return decode;
        },
        expiresIn() {
            if (this.token?.exp) { return dayjs(this.token.exp * 1000).fromNow(); }
            return "never";
        },
        expired() {
            if (!this.token?.exp) return true;
            return dayjs().isAfter(dayjs(this.token.exp * 1000));
        },
        availableAt() {
            if (this.liveTime && this.timezone && this.liveDate) {
                return dayjs.tz(`${this.liveDate} ${this.liveTime}`, this.timezone).toISOString();
            }
            return dayjs().toISOString();
        },
        credits() {
            if (!this.isEditor && !this.token) return null;
            return this.isEditor
                ? {
                    editor: {
                        name: this.creditName,
                        user: this.$store.state.userdata.user.id,
                    },
                } : {
                    discord: {
                        name: this.token.name,
                        link: this.token.link,
                        user: this.token.user,
                    },
                };
        },
        videoObj() {
            return {
                title: this.videoTitle || "Example Title",
                placeholderType: this.placeholderType || "scheduled-yt-stream",
                channel: this.channel || {
                    id: "ExampleIdThatDoesntExist",
                    name: "<CHANNEL>",
                    english_name: "<CHANNEL>",
                },
                thumbnail: this.thumbnail || "",
                type: "placeholder",
                status: "upcoming",
                start_scheduled: this.availableAt,
                available_at: this.availableAt,
                credits: this.credits || {
                    discord: {
                        user: "Discord User",
                        link: "jctkgHBt4b",
                    },
                },
                link: this.sourceUrl,
            };
        },
    },
    watch: {
        tab(nv) {
            if (nv === 0) this.id = "";
        },
    },
    async mounted() {
        if (this.token?.link) { this.discordCredits = await backendApi.discordServerInfo(this.token.link); }
        const { id } = this.$route.query;
        if (id) {
            this.id = id;
            this.loadExistingPlaceholder(id);
            this.tab = 1;
        }
    },
    methods: {
        onSubmit() {
            if (this.$refs.form.validate() && (this.isEditor || (this.token && !this.expired))) {
                const titlePayload = {
                    name: this.videoTitle,
                    ...this.videoTitleJP && { jp_name: this.videoTitleJP },
                    link: this.sourceUrl,
                    ...this.thumbnail && { thumbnail: this.thumbnail },
                    placeholderType: this.placeholderType,
                    certainty: this.certainty,
                    credits: this.credits,
                };
                const body = {
                    channel_id: this.channel.id,
                    title: titlePayload,
                    liveTime: this.availableAt,
                    duration: (+this.duration) * 60, // convert min to sec
                    id: undefined,
                };
                if (this.id) body.id = this.id;
                backendApi.addPlaceholderStream(body, this.$store.state.userdata?.jwt, this.$route.query?.token)
                    .then(() => {
                        this.success = true;
                    })
                    .catch((e) => {
                        this.error = true;
                        this.errorMessage = e;
                    });
            } else {
                this.error = true;
                this.errorMessage = "You're not a valid Holodex Editor, or your discord-generated placeholder creation link has expired";
            }
        },
        changeDate(amount, unit) {
            if (unit === "hour") {
                // hour
                this.liveTime = dayjs(`${this.liveDate} ${this.liveTime}`).add(amount, unit).format("HH:mm");
            } else {
                // day
                this.liveDate = dayjs(this.liveDate).add(amount, unit).format("YYYY-MM-DD");
            }
        },
        async loadExistingPlaceholder(id: string) {
            const video = (await backendApi.video(id, undefined, 0)).data;
            console.log(video);

            this.videoTitle = video.title;
            this.videoTitleJP = video.jp_name;
            this.sourceUrl = video.link;
            this.thumbnail = video.thumbnail;
            this.placeholderType = video.placeholderType;
            this.timezone = "Asia/Tokyo";
            const vt = dayjs(video.start_scheduled).tz(this.timezone);
            this.liveDate = vt.format("YYYY-MM-DD");
            this.liveTime = vt.format("HH:mm");
            this.duration = video.duration / 60;
            this.certainty = video.certainty;
            this.$set(this, "channel", video.channel);
        },
    },
};
</script>

<style>
</style>
