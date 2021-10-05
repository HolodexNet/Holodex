<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container>
      <v-row>
        <v-col cols="8">
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
          <v-alert v-else-if="!isEditor" type="error" text>
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
              <channel-autocomplete v-model="channel" label="Channel" />
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
                required
                :rules="[requiredRule, linkRule]"
              />
              <v-row>
                <v-col>
                  <v-select
                    v-model="ghostType"
                    :items="GHOST_TYPES"
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
              <v-row>
                <v-col>
                  <v-select
                    v-model="timezone"
                    :items="['JST', 'PST', 'GMT']"
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
                        readonly
                        v-bind="attrs"
                        :rules="[requiredRule, timeRule]"
                        v-on="on"
                      />
                    </template>
                    <v-date-picker
                      v-model="liveDate"
                    />
                  </v-menu>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="liveTime"
                    label="Time"
                    type="time"
                    required
                    :rules="[requiredRule, timeRule]"
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
                Submit
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <video-card :video="videoObj" include-channel />
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="error" color="error">
      {{ errorMessage }}
    </v-snackbar>
    <v-snackbar v-model="success" timeout="2000" color="success">
      Successfully added Ghost Stream
    </v-snackbar>
  </v-form>
</template>

<script>
import ChannelAutocomplete from "@/components/channel/ChannelAutocomplete.vue";
import { dayjs } from "@/utils/time";
import VideoCard from "@/components/video/VideoCard.vue";
import jwtDecode from "jwt-decode";
import backendApi from "@/utils/backend-api";

export default {
    components: {
        ChannelAutocomplete,
        VideoCard,
    },
    data() {
        return {
            valid: false,
            channel: null,
            videoTitle: "",
            videoTitleJP: "",
            creditName: this.$store.state.userdata?.user?.username,
            sourceUrl: "",
            thumbnail: "",
            ghostType: null,
            certainty: "",
            liveDate: dayjs().format("YYYY-MM-DD"),
            liveTime: "",
            timezone: "JST",
            duration: 60,
            GHOST_TYPES: [
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
                return dayjs(`${this.liveDate} ${this.liveTime}`).tz(this.timezone);
            }
            return dayjs().toString();
        },
        videoObj() {
            return {
                title: this.videoTitle || "Example Title",
                ghostType: this.ghostType || "scheduled-yt-stream",
                channel: this.channel || {
                    id: "ExampleIdThatDoesntExist",
                    name: "Example Name",
                    name_jp: "Example JP Name",
                },
                thumbnail: this.thumbnail || "",
                type: "ghost",
                status: "upcoming",
                start_scheduled: this.availableAt,
                available_at: this.availableAt,
                credits: {
                    discord: {
                        user: "Discord User",
                        link: "jctkgHBt4b",
                    },
                },
                link: this.sourceUrl,
            };
        },
    },
    async mounted() {
        if (this.token?.link) { this.discordCredits = await backendApi.discordServerInfo(this.token.link); }
    },
    methods: {
        onSubmit() {
            if (this.$refs.form.validate() && (this.isEditor || (this.token && !this.expired))) {
                const credits = this.isEditor
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
                const titlePayload = {
                    name: this.videoTitle,
                    ...this.videoTitleJP && { jp_name: this.videoTitleJP },
                    link: this.sourceUrl,
                    thumbnail: this.thumbnail,
                    ghostType: this.ghostType,
                    certainty: this.certainty,
                    credits,
                };
                const jwt = this.$store.state.userdata.jwt || this.$route.query?.token;
                backendApi.addGhostStream({
                    channel_id: this.channel.id,
                    title: titlePayload,
                    liveTime: this.availableAt,
                    duration: +this.duration,
                }, jwt).then(() => {
                    this.success = true;
                })
                    .catch((e) => {
                        this.error = true;
                        this.errorMessage = e;
                    });
            }
        },
    },
};
</script>

<style>

</style>
