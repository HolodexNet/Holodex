<template>
  <!-- <div class="text-xl">
      {{ $t("channelRequest.PageTitle") }}
    </div> -->
  <!-- flex: 1 1 auto;
font-size: 0.875rem;
font-weight: 400;
letter-spacing: 0.0178571429em;
padding: 1rem;
text-transform: none; -->
  <div class="p-2">
    <div class="text-lg font-bold"></div>

    <RadioGroup v-model="type" class="2xl:flex 2xl:flex-row">
      <!-- <RadioGroupLabel>
        {{ $t("channelRequest.RequestType") }}
      </RadioGroupLabel> -->
      <RadioGroupOption
        v-for="ct in channelTypes"
        v-slot="{ checked, active }"
        as="template"
        :value="ct.value"
      >
        <span
          :class="[
            active ? 'ring-2 ring-opacity-60 ring-offset-2 ' : '',
            checked
              ? 'bg-secondary-400 bg-opacity-50  '
              : ' bg-secondary-700 bg-opacity-25',
          ]"
          class="relative m-2 flex max-w-md cursor-pointer justify-between rounded-lg border border-secondary px-5 py-4 shadow-md focus:outline-none"
        >
          <RadioGroupLabel
            as="p"
            :class="checked ? 'text-opacity-100' : 'text-opacity-50'"
            class="font-medium"
          >
            {{ ct.text }}
          </RadioGroupLabel>
          <div v-show="checked" class="shrink-0 text-white">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#fff" fill-opacity="0.2" />
              <path
                d="M7 13l3 3 7-7"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </span>
      </RadioGroupOption>
    </RadioGroup>
    <!-- </v-radio-group> -->

    <div v-show="type && alertText(type)" class="alert my-4 border border-info">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div>
        <div
          class="i-icon-park-outline:guide-board mr-2 min-w-[32px] text-3xl"
        ></div>
        <p v-html="alertText(type)" />
      </div>
    </div>
    <template v-if="type">
      <vtuber-autocomplete
        v-if="type === MODIFY_EXISTING || type === DELETE"
        v-model="channel"
      />
      <h-text-field
        v-else
        v-model="link"
        title="Channel URL"
        placeholder="https://www.youtube.com/..."
      ></h-text-field>

      <h-text-field
        v-if="type !== DELETE && type !== ADD_CLIPPER"
        v-model="english_name"
        :title="$t('channelRequest.EnglishNameLabel')"
        :explanation="$t('channelRequest.EnglishNameHint')"
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
          type === ADD_CLIPPER || type === MODIFY_EXISTING ? [requiredRule] : []
        "
      />
      <h-text-field
        v-if="type === ADD_VTUBER || type === MODIFY_EXISTING"
        v-model="org"
        :title="$t('channelRequest.VtuberGroupLabel')"
        :explanation="$t('channelRequest.VtuberGroupHint')"
        placeholder="Hololive, Nijisanji, ..."
      />

      <h-text-field
        v-if="type !== DELETE"
        v-model="twitter"
        :title="$t('channelRequest.TwitterHandle')"
        explanation="@username"
        placeholder="@xyzabc"
      />
      <h-text-field
        v-model="contact"
        :title="$t('channelRequest.DirectContactLabel')"
        :explanation="$t('channelRequest.DirectContactDisclaimer')"
        placeholder="@abc / discord#1234 / (email 😞)"
        :required="type === DELETE"
      />
      <h-text-field
        v-model="comments"
        as="textarea"
        :title="$t('channelRequest.Comments')"
        :explanation="$t('channelRequest.CommentsHint')"
        placeholder=""
        class="h-40"
      />
    </template>
    <button
      v-if="type"
      class="btn btn-primary mt-2 w-32 text-lg shadow-md"
      @click="onSubmit"
    >
      <div class="i-mdi:check"></div>
    </button>
  </div>
  <v-snackbar v-model="error" color="error">
    {{ errorMessage }}
  </v-snackbar>
  <v-snackbar v-model="success" timeout="2000" color="success"> OK </v-snackbar>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import { RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
const ADD_VTUBER =
  "Add a Vtuber ▶️ for Holodex to track the channel and clips.";
const ADD_CLIPPER = "I'd like to ➕ add a clipping/subbing channel to Holodex.";
const MODIFY_EXISTING = "I'd like to modify existing channel";
const DELETE = "I'd like to delete my channel";
export default defineComponent({
  components: {
    RadioGroup,
    RadioGroupLabel,
    RadioGroupOption,
  },
  data() {
    return {
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
        text: "",
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
        text: "",
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
          return "";
        case DELETE:
          return this.$t("channelRequest.DeletionRequirementText");
        default:
          return "";
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
          content: "Look what the cat dragged in...",
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
              text: "",
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
