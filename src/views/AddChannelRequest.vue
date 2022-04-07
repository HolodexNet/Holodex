<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container>
      <v-row>
        <v-col
          sm="12"
          md="10"
          offset-md="1"
          lg="8"
          offset-lg="2"
        >
          <v-card>
            <v-card-title>
              {{ $t('channelRequest.PageTitle') }}
            </v-card-title>
            <v-card-text>
              <v-alert v-if="type && alertText(type)" type="info">
                <p v-html="alertText(type)" />
              </v-alert>

              <v-radio-group v-model="type" :label="$t('channelRequest.RequestType')">
                <v-radio
                  v-for="ct in channelTypes"
                  :key="'ct' + ct.value"
                  :label="ct.text"
                  :value="ct.value"
                />
              </v-radio-group>

              <channel-autocomplete
                v-if="type === MODIFY_EXISTING || type === DELETE"
                v-model="channel"
                label="Channel"
              />

              <v-text-field
                v-else
                v-model="link"
                label="Channel URL"
                placeholder="https://www.youtube.com/channel/UC_____"
                hint="https://www.youtube.com/channel/UC_____"
                :rules="[channelURLRule]"
              />
              <v-text-field
                v-if="type !== DELETE && type !== ADD_CLIPPER"
                v-model="english_name"
                :label="$t('channelRequest.EnglishNameLabel')"
                :hint="$t('channelRequest.EnglishNameHint')"
              />

              <v-select
                v-if="!(type === ADD_VTUBER || type === DELETE)"
                v-model="lang"
                :items="languages"
                :label="$t('channelRequest.ChannelLanguageLabel')"
                :required="type === ADD_CLIPPER || type === MODIFY_EXISTING"
                :rules="
                  type === ADD_CLIPPER || type === MODIFY_EXISTING
                    ? [requiredRule]
                    : []
                "
              />
              <v-text-field
                v-if="type === ADD_VTUBER || type === MODIFY_EXISTING"
                v-model="org"
                :label="$t('channelRequest.VtuberGroupLabel')"
                :hint="$t('channelRequest.VtuberGroupHint')"
                placeholder="Hololive, Nijisanji, ..."
              />

              <v-text-field
                v-if="type !== DELETE"
                v-model="twitter"
                :label="$t('channelRequest.TwitterHandle')"
                hint="@username"
                placeholder="@xyzabc"
                :rules="[twitterRule]"
              />
              <v-text-field
                v-model="contact"
                :label="$t('channelRequest.DirectContactLabel')"
                :hint="$t('channelRequest.DirectContactDisclaimer')"
                placeholder="@abc / discord#1234 / contact@hello.me"
                :required="type === DELETE"
                :rules="
                  type === DELETE ? [requiredRule]
                  : []
                "
              />
              <v-textarea
                v-model="comments"
                :label="$t('channelRequest.Comments')"
                :hint="$t('channelRequest.CommentsHint')"
                placeholder=""
                outlined
              />

              <v-btn
                class="mt-4"
                :color="success?'success':'primary'"
                large
                elevation="8"
                @click="onSubmit"
              >
                <v-icon>{{ icons.mdiCheck }}</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="error" color="error">
      {{ errorMessage }}
    </v-snackbar>
    <v-snackbar v-model="success" timeout="2000" color="success">
      OK
    </v-snackbar>
  </v-form>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import { mdiMinusBox } from "@mdi/js";
import ChannelAutocomplete from "@/components/channel/ChannelAutocomplete.vue";

const ADD_VTUBER = "Add a Vtuber ▶️ for Holodex to track the channel and clips.";
const ADD_CLIPPER = "I'd like to ➕ add a clipping/subbing channel to Holodex.";
const MODIFY_EXISTING = "I'd like to modify existing channel";
const DELETE = "I'd like to delete my channel";
export default {
    components: {
        ChannelAutocomplete,
    },
    data() {
        return {
            mdiMinusBox,

            languages: [
                {
                    text: "English",
                    value: "en",
                },
                {
                    text: "日本語",
                    value: "ja",
                },
                {
                    text: "中文",
                    value: "zh",
                }, {
                    text: "한국어",
                    value: "ko",
                },
                {
                    text: "Español",
                    value: "es",
                },
                {
                    text: "Français",
                    value: "fr",
                },
                {
                    text: "ไทย (Thai)",
                    value: "th",
                },

                {
                    text: "Bahasa Indonesia / Melayu",
                    value: "id",
                },
                {
                    text: "Русский язык",
                    value: "ru",
                },

            ],
            channelTypes: [
                {
                    text: this.$t("channelRequest.Types.AddVtuber"),
                    value: ADD_VTUBER,
                },
                {
                    text: this.$t("channelRequest.Types.AddClipper"),
                    value: ADD_CLIPPER,
                },
                {
                    text: this.$t("channelRequest.Types.ModifyExistingInfo"),
                    value: MODIFY_EXISTING,
                },
                {
                    text: this.$t("channelRequest.Types.DeleteChannel"),
                    value: DELETE,
                },
            ],

            error: false,
            errorMessage: "",
            success: false,

            DELETE,
            ADD_CLIPPER,
            ADD_VTUBER,
            MODIFY_EXISTING,
            // form data:
            link: "",
            english_name: "",
            type: "",
            lang: "",
            twitter: "",
            contact: "",
            comments: "",
            org: "",
            channel: {},
        };
    },
    computed: {},
    watch: { type() {
        this.link = "";
        this.channel = {};
        this.english_name = "";
        this.lang = "";
        this.twitter = "";
        this.contact = "";
        this.comments = "";
        this.org = "";
    } },
    methods: {
        requiredRule: (v) => ((!!v) || "Required"),
        linkRule: (v) => !!v.match(/^https?:\/\/[\w-]+(\.[\w-]+)+\.?(\/\S*)?/) || "Invalid url",
        twitterRule: (v) => (!v || !!v.match(/^@.*$/)) || "@ABC",
        channelURLRule(v) {
            const REGEX = /(?:https?:\/\/)(?:www\.)?youtu(?:be\.com\/)(?:channel|c)\/([\w-_]*)$/i;

            const cid = v.match(REGEX);
            console.log(cid);
            return (
                (cid
                    && !cid[0].includes("/c/")
                    && cid[1].length > 12
                    && cid[0].startsWith("ht"))
                || this.$t("channelRequest.ChannelURLErrorFeedback")
            );
        },
        alertText(type) {
            switch (type) {
                case ADD_VTUBER:
                    return this.$t("channelRequest.VtuberRequirementText");
                case ADD_CLIPPER:
                    return this.$t("channelRequest.ClipperRequirementText");
                case MODIFY_EXISTING: return false;
                case DELETE: return this.$t("channelRequest.DeletionRequirementText");
                default:
                    return false;
            }
        },

        onSubmit() {
            if (this.$refs.form.validate()) {
                const ifValid = (bool: Boolean, val: any) => {
                    if (bool) return [val];
                    return [];
                };
                const body = {
                    content: "‌Look what the cat dragged in...",
                    embeds: [{
                        title: "Holodex New Subber Request",
                        color: 1955806, // This is optional, you can look for decimal colour codes at https://www.webtoolkitonline.com/hexadecimal-decimal-color-converter.html
                        fields: [{
                            name: "Request Type",
                            value: this.type,
                            inline: false,
                        }, {
                            name: "Channel Link",
                            value: this.link || `https://www.youtube.com/channel/${this.channel.id}`,
                            inline: false,
                        }, ...ifValid(this.english_name, {
                            name: "Alternate Channel Name (optional)",
                            value: this.english_name,
                            inline: false,
                        }), ...ifValid(this.lang, {
                            name: "What language is your channel?",
                            value: this.lang,
                            inline: false,

                        }), ...ifValid(this.twitter, {
                            name: "Twitter Handle (optional)",
                            value: this.twitter,
                            inline: false,
                        }), ...ifValid(this.contact, {
                            name: "Direct contact",
                            value: this.contact,
                            inline: false,
                        }), ...ifValid(this.org || this.comments, {
                            name: "Comments",
                            value: `[${this.org}] ${this.comments}`,
                            inline: false,
                        })],
                        footer: {
                            text: "Holodex UI",
                        },
                    }],
                };
                backendApi
                    .requestChannel(
                        body,
                    )
                    .then(() => {
                        this.success = true;
                        this.link = "";
                        this.channel = {};
                        this.english_name = "";
                        this.lang = "";
                        this.twitter = "";
                        this.contact = "";
                        this.comments = "";
                        this.org = "";
                    })
                    .catch((e) => {
                        this.error = true;
                        this.errorMessage = e;
                    });
            } else {
                this.error = true;
                this.errorMessage = "Some error occurred.";
            }
        },
    },
};
</script>

<style>
</style>
