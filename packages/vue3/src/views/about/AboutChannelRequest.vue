<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <!-- <div class="text-xl">
      {{ $t("channelRequest.PageTitle") }}
    </div> -->
    <v-card-text>
      <div class="text-lg font-bold">
        {{ $t("channelRequest.RequestType") }}
      </div>
      <div class="max-w-sm form-control lang-settings">
        <label
          v-for="ct in channelTypes"
          :key="'ct' + ct.value"
          class="justify-start cursor-pointer label"
        >
          <input
            v-model="type"
            :value="ct.value"
            type="radio"
            name="req-type"
            class="mr-2 border-solid radio radio-primary"
          />
          <span class="label-text">{{ ct.text }}</span>
        </label>
      </div>
      <!-- </v-radio-group> -->

      <div v-if="type && alertText(type)" class="my-4 border alert border-info">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div>
          <div
            class="min-w-[32px] mr-2 text-3xl i-icon-park-outline:guide-board"
          ></div>
          <p v-html="alertText(type)" />
        </div>
      </div>
      <template v-if="type">
        <channel-autocomplete
          v-if="type === MODIFY_EXISTING || type === DELETE"
          v-model:model-value="channel"
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
          v-if="
            type !== ADD_VTUBER &&
            type !== DELETE &&
            type === MODIFY_EXISTING &&
            channel &&
            (channel.value as any)?.type === 'clipper'
          "
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
          placeholder="@abc / discord#1234 / (email 😞)"
          :required="type === DELETE"
          :rules="type === DELETE ? [requiredRule] : []"
        />
        <v-textarea
          v-model="comments"
          :label="$t('channelRequest.Comments')"
          :hint="$t('channelRequest.CommentsHint')"
          placeholder=""
          outlined
        />
      </template>
      <v-btn
        class="mt-4"
        :color="success ? 'success' : 'primary'"
        large
        elevation="8"
        @click="onSubmit"
      >
        <v-icon>{{ icons.mdiCheck }}</v-icon>
      </v-btn>
    </v-card-text>
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
//   import ChannelAutocomplete from "@/components/channel/ChannelAutocomplete.vue";

const ADD_VTUBER =
  "Add a Vtuber ▶️ for Holodex to track the channel and clips.";
const ADD_CLIPPER = "I'd like to ➕ add a clipping/subbing channel to Holodex.";
const MODIFY_EXISTING = "I'd like to modify existing channel";
const DELETE = "I'd like to delete my channel";
export default defineComponent({
  data() {
    return {
      mdiMinusBox,
      valid: true,

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
        },
        {
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
      type: undefined,
      lang: "",
      twitter: "",
      contact: "",
      comments: "",
      org: "",
      channel: {
        text: "...",
        value: {
          id: "",
          name: "",
          english_name: "",
        },
      },
    };
  },
  computed: {},
  watch: {
    type() {
      this.link = "";
      this.channel = {
        text: "...",
        value: {
          id: "",
          name: "",
          english_name: "",
        },
      };
      this.english_name = "";
      this.lang = "";
      this.twitter = "";
      this.contact = "";
      this.comments = "";
      this.org = "";
    },
  },
  methods: {
    requiredRule: (v: string) => !!v || "Required",
    linkRule: (v: string) =>
      !!v.match(/^https?:\/\/[\w-]+(\.[\w-]+)+\.?(\/\S*)?/) || "Invalid url",
    twitterRule: (v: string) => !v || !!v.match(/^@.*$/) || "@ABC",
    channelURLRule(v: string) {
      const REGEX =
        /(?:https?:\/\/)(?:www\.)?youtu(?:be\.com\/)(?:channel)\/([\w-_]*)$/i;

      const cid = v.match(REGEX);
      console.log(cid);
      return (
        (cid &&
          !cid[0].includes("/c/") &&
          cid[1].length > 12 &&
          cid[0].startsWith("ht")) ||
        this.$t("channelRequest.ChannelURLErrorFeedback")
      );
    },
    alertText(type: string) {
      switch (type) {
        case ADD_VTUBER:
          return this.$t("channelRequest.VtuberRequirementText");
        case ADD_CLIPPER:
          return this.$t("channelRequest.ClipperRequirementText");
        case MODIFY_EXISTING:
          return false;
        case DELETE:
          return this.$t("channelRequest.DeletionRequirementText");
        default:
          return false;
      }
    },

    async onSubmit() {
      if (this.type === ADD_VTUBER || this.type === ADD_CLIPPER) {
        // validate it's not added already:
        const regex =
          /(?:https?:\/\/)(?:www\.)?youtu(?:be\.com\/)(?:channel)\/([\w\-_]*)/gi;
        const matches = [...this.link.matchAll(regex)];
        const id = matches?.[0]?.[1];

        try {
          const exists = id && (await backendApi.channel(id));
          if (exists && exists.data && exists.data.id) {
            this.$router.push({ path: `/channel/${id}` });
            return;
          }
        } catch (e) {
          console.error(e);
          // it's fine to not exist, since that's what the form is for.
        }
      }
      if ((this.$refs.form as any).validate()) {
        const ifValid = (bool: any, val: any) => {
          if (bool) return [val];
          return [];
        };
        const body = {
          content: "‌Look what the cat dragged in...",
          embeds: [
            {
              title: "Holodex New Subber Request",
              color: 1955806, // This is optional, you can look for decimal colour codes at https://www.webtoolkitonline.com/hexadecimal-decimal-color-converter.html
              fields: [
                {
                  name: "Request Type",
                  value: this.type,
                  inline: false,
                },
                {
                  name: "Channel Link",
                  value:
                    this.link ||
                    `https://www.youtube.com/channel/${this.channel.value.id}`,
                  inline: false,
                },
                ...ifValid(this.english_name, {
                  name: "Alternate Channel Name (optional)",
                  value: this.english_name,
                  inline: false,
                }),
                ...ifValid(this.lang, {
                  name: "What language is your channel?",
                  value: this.lang,
                  inline: false,
                }),
                ...ifValid(this.twitter, {
                  name: "Twitter Handle (optional)",
                  value: this.twitter,
                  inline: false,
                }),
                ...ifValid(this.contact, {
                  name: "Direct contact",
                  value: this.contact,
                  inline: false,
                }),
                ...ifValid(this.org || this.comments, {
                  name: "Comments",
                  value: `[${this.org}] ${this.comments}`,
                  inline: false,
                }),
              ],
              footer: {
                text: "Holodex UI",
              },
            },
          ],
        };
        backendApi
          .requestChannel(body)
          .then(() => {
            this.success = true;
            this.link = "";
            this.channel = {
              text: "...",
              value: {
                id: "",
                name: "",
                english_name: "",
              },
            };
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
});
</script>

<style></style>
