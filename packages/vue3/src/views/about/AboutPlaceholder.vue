<template>
  <!-- <v-form ref="form" v-model="valid" lazy-validation> -->
  <h-alert v-if="!isEditor && token && !expired" class="pa-2 mb-2" type="info">
    Editing as {{ token.user }} from
    {{ discordCredits ? discordCredits.data.guild.name : "" }} Discord
    <br />
    Your session expires: {{ expiresIn }}. Please refresh if it is about to
    expire
  </h-alert>
  <h-alert v-else-if="!isEditor" type="error">
    You are not an editor or token has expired, please login or generate a new
    token using our bot
  </h-alert>
  <h-text-field
    v-if="isEditor"
    v-model="creditName"
    title="Editor Credit Name"
    explanation="Use a different name when being credited on the placeholder"
  ></h-text-field>

  <v-tabs v-model="tab" icons-and-text class="mb-4">
    <v-tab> New </v-tab>
    <v-tab> Existing </v-tab>
  </v-tabs>
  <div class="flex flex-col gap-4 px-4">
    <div v-if="tab === 1" class="form-control">
      <label class="label">
        <span class="label-text">Existing Placeholder ID (11 characters)</span>
      </label>
      <label class="input-group">
        <span>ID</span>
        <input
          v-model="id"
          type="text"
          placeholder="4a7f32A_4a2"
          class="input-bordered input w-full border-solid"
        />
        <button class="btn btn-square" @click="loadExistingPlaceholder(id)">
          <div class="i-ion:checkmark"></div>
        </button>
      </label>
    </div>

    <!-- <video-selector
      v-if="tab === 1 && !id"
      key="x921b"
      :hide-placeholders="false"
      @video-clicked="
        (video) => {
          id = video.id;
          loadExistingPlaceholder(id);
        }
      "
    /> -->
    <vtuber-autocomplete v-model="channel" />
    <h-text-field
      v-model="videoTitle"
      title="Video/Event Title"
      explanation="The title of placeholder"
    ></h-text-field>
    <h-text-field
      v-model="videoTitleJP"
      title="Japanese Event Title"
      explanation="(shown to users with 'Use EN Name' turned off)"
    ></h-text-field>
    <h-text-field
      v-model="sourceUrl"
      placeholder="https://twitter.com/..."
      title="Source URL"
      explanation="Link to more detail about the event. eg. URL to twitter schedule
            post or twitch channel, or link to a concert page"
    ></h-text-field>
    <h-text-field
      v-model="thumbnail"
      placeholder="https://imgur.com/..."
      title="Thumbnail Image"
    ></h-text-field>
    <div class="flex flex-row flex-wrap gap-4">
      <span class="inline-block flex-grow basis-60">
        <div class="form-control">
          <label class="label">
            <label class="label-text">Event Type</label></label
          >

          <label class="radio-label">
            <input
              v-model="placeholderType"
              type="radio"
              name="radio-10"
              value="scheduled-yt-stream"
              class="peer radio outline outline-2 checked:bg-red-500"
            />
            <span class="label-text peer-checked:text-secondary">
              Scheduled YT Stream
            </span>
          </label>
          <label class="radio-label">
            <input
              v-model="placeholderType"
              type="radio"
              name="radio-10"
              value="external-stream"
              class="peer radio outline outline-2 checked:bg-blue-500"
            />
            <span class="label-text peer-checked:text-secondary">
              External Stream (eg. Twitch/Twitcast)
            </span>
          </label>
          <label class="radio-label">
            <input
              v-model="placeholderType"
              type="radio"
              name="radio-10"
              value="event"
              class="peer radio outline outline-2 checked:bg-orange-500"
            />
            <span class="label-text peer-checked:text-secondary"> Event </span>
          </label>
        </div>
      </span>
      <span class="inline-block flex-grow basis-60">
        <div class="form-control">
          <label class="label">
            <label class="label-text">Certainty</label></label
          >
          <label class="radio-label">
            <input
              v-model="certainty"
              type="radio"
              name="radio-11"
              value="certain"
              class="peer radio outline outline-2 checked:bg-secondary"
            />
            <span class="label-text peer-checked:text-secondary">Certain</span>
          </label>
          <label class="radio-label">
            <input
              v-model="certainty"
              type="radio"
              name="radio-11"
              value="likely"
              class="peer radio outline outline-2 checked:bg-secondary"
            />
            <span class="label-text peer-checked:text-secondary"
              >Likely (This is an educated guess)</span
            >
          </label>
        </div>
      </span>
    </div>
    <!-- <v-select
        v-model="placeholderType"
        density="compact"
        variant="outlined"
        :items="PLACEHOLDER_TYPES"
        label="Event Type"
        hide-details="auto"
        required
        :rules="[requiredRule]"
      /> -->
    <!-- <v-select
        v-model="certainty"
        density="compact"
        variant="outlined"
        :items="CERTAINTY_CHOICE"
        label="Certainty"
        required
        hide-details="auto"
        :rules="[requiredRule]"
      /> -->
    <div class="flex flex-row justify-between">
      <div class="flex w-min flex-col gap-2">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Timezone</span>
          </label>

          <select class="select-bordered select w-full max-w-xs border-solid">
            <option value="Etc/GMT" selected>UTC (+0)</option>
            <option value="Asia/Tokyo">JST (+8)</option>
            <option value="America/Los_Angeles">Pacific Time (-?)</option>
            <option value="America/New_York">
              Eastern Time (EST/EDT) (-?)
            </option>
          </select>
        </div>

        <!-- ignore this error, it works fine -->
        <date-picker
          v-model="liveDate"
          mode="dateTime"
          :timezone="timezone"
          :is-dark="theme.dark"
          color="gray"
          class=""
          is24hr
          :min-date="minDate"
          :minute-increment="5"
          :model-config="{ type: 'string', mask: 'iso' }"
        ></date-picker>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Duration</span>
            <span class="label-text-alt text-opacity-60"> </span>
          </label>
          <input
            v-model="duration"
            type="number"
            class="input-bordered input w-full border-solid"
          />
        </div>
      </div>
      <div class="form-control mx-auto hidden w-full max-w-xs lg:block">
        <label class="label"> <span class="label-text">Preview:</span></label>
        <video-card
          :video="(videoObj as any)"
          include-channel
          class="max-w-xs"
        />
      </div>
    </div>
    <div class="form-control my-2 block w-full max-w-xs lg:hidden">
      <div class="divider">Preview</div>
      <video-card :video="(videoObj as any)" include-channel class="max-w-xs" />
    </div>

    <h-btn color="primary" @click="onSubmit">
      {{ id ? "Submit Placeholder Modification" : "Create new Placeholder" }}
    </h-btn>
  </div>
  <!-- </v-form> -->
</template>

<script lang="ts">
import { dayjs } from "@/utils/time";
import jwtDecode from "jwt-decode";
import backendApi from "@/utils/backend-api";
import { mdiMinusBox } from "@mdi/js";
import { useSiteStore } from "@/stores/site";
import "v-calendar/dist/style.css";
import { DatePicker } from "v-calendar";
import { useThemeStore } from "@/stores/theme";
import { useDisplay } from "vuetify";
import VtuberAutocomplete from "@/components/channel/VtuberAutocomplete.vue";
import { useToast } from "vue-toast-notification";

export default defineComponent({
  components: {
    DatePicker,
    VtuberAutocomplete,
  },
  setup() {
    const display = useDisplay();
    const site = useSiteStore();
    const theme = useThemeStore();
    const creditName = ref(site.user?.username);
    const { open: toast } = useToast();

    return { creditName, site, theme, display, toast };
  },
  data() {
    return {
      mdiMinusBox,

      tab: 0,
      id: "",
      valid: false,
      channel: undefined as undefined | { text: string; value: ShortChannel },
      videoTitle: "",
      videoTitleJP: "",
      sourceUrl: "",
      thumbnail: "",
      placeholderType: undefined,
      certainty: undefined,
      liveDate: dayjs().startOf("hour").toISOString(),
      minDate: dayjs().startOf("day").toDate(),
      timezone: "Asia/Tokyo",
      duration: 60,
      CERTAINTY_CHOICE: [
        {
          title: "Certain",
          value: "certain",
        },
        {
          title: "Likely",
          value: "likely",
        },
      ],
      showDatePicker: false,
      discordCredits: undefined as any,
      requiredRule: (v: any) => !!v || "Required",
      linkRule: (v: any) =>
        !!v.match(/^https?:\/\/[\w-]+(\.[\w-]+)+\.?(\/\S*)?/) || "Invalid url",
      timeRule: () => !!this.availableAt || "Invalid time",
    };
  },
  computed: {
    isEditor() {
      const role = this.site.user?.role;
      return ["editor", "admin"].includes(role ?? "");
    },
    token() {
      const jwt: string = this.$route.query?.token as string;
      if (!jwt) return undefined;
      const decode = jwtDecode(jwt) as {
        exp: number;
        iat: number;
        name: string;
        link: string;
        user: string;
      };
      return decode;
    },
    expiresIn() {
      if (this.token?.exp) {
        return dayjs(this.token.exp * 1000).fromNow();
      }
      return "never";
    },
    expired() {
      if (!this.token?.exp) return true;
      return dayjs().isAfter(dayjs(this.token.exp * 1000));
    },
    availableAt() {
      return this.liveDate;
    },
    credits() {
      if (!this.isEditor && !this.token) return null;
      return this.isEditor
        ? {
            editor: {
              name: this.creditName,
              user: this.site.user?.id,
            },
          }
        : {
            discord: {
              name: this.token?.name,
              link: this.token?.link,
              user: this.token?.user,
            },
          };
    },
    videoObj() {
      return {
        title: this.videoTitle || "Example Title",
        placeholderType: this.placeholderType || "scheduled-yt-stream",
        channel: {
          id: this.channel?.value?.id || "ExampleIdThatDoesntExist",
          name: this.channel?.value?.name || "<CHANNEL>",
          english_name: this.channel?.value?.english_name || "<CHANNEL>",
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
    channel() {
      console.log(JSON.stringify(this.channel));
    },
  },
  async mounted() {
    if (this.token?.link) {
      this.discordCredits = await backendApi.discordServerInfo(this.token.link);
    }
    const { id } = this.$route.query;
    if (id && this.isEditor) {
      this.id = id as string;
      this.loadExistingPlaceholder(this.id);
      this.tab = 1;
    }
  },
  methods: {
    onSubmit() {
      if (
        this.$refs.form.validate() &&
        (this.isEditor || (this.token && !this.expired))
      ) {
        const titlePayload = {
          name: this.videoTitle,
          ...(this.videoTitleJP && { jp_name: this.videoTitleJP }),
          link: this.sourceUrl,
          ...(this.thumbnail && { thumbnail: this.thumbnail }),
          placeholderType: this.placeholderType,
          certainty: this.certainty,
          credits: this.credits,
        };
        const body = {
          channel_id: this.channel?.value?.id,
          title: titlePayload,
          liveTime: this.availableAt,
          duration: +this.duration * 60, // convert min to sec
          id: undefined as string | undefined,
        };
        if (this.id) body.id = this.id;
        backendApi
          .addPlaceholderStream(
            body,
            this.site.jwtToken,
            this.$route.query?.token
          )
          .then(() => {
            this.toast({
              message: "Successfully added Placeholder Stream",
              type: "success",
              duration: 2500,
              position: "bottom",
            });
          })
          .catch((e) => {
            this.toast({
              message: e,
              type: "error",
              duration: 3000,
              position: "bottom",
            });
          });
      } else {
        this.toast({
          message:
            "You're not a valid Holodex Editor, or your discord-generated placeholder creation link has expired",
          type: "error",
          duration: 3000,
          position: "bottom",
        });
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
      this.liveDate = vt.toISOString();
      this.duration = video.duration / 60;
      this.certainty = video.certainty;
      this.channel = { text: video.channel.name, value: video.channel };
    },
  },
});
</script>

<style>
.radio-label {
  @apply flex items-center gap-2 px-1 py-2;
}
</style>
