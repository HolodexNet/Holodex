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
  <h-input
    v-if="isEditor"
    v-model="creditName"
    title="Editor Credit Name"
    explanation="Use a different name when being credited on the placeholder"
  />

  <div class="flex flex-col gap-4">
    <div class="tabs tabs-boxed bg-base-100 p-0">
      <a
        class="tab tab-lg"
        :class="{ 'tab-active': tab === 0 }"
        @click="tab = 0"
      >
        New
      </a>
      <a
        class="tab tab-lg"
        :class="{ 'tab-active': tab === 1 }"
        @click="tab = 1"
      >
        Existing
      </a>
    </div>

    <div v-if="tab === 1" class="form-control">
      <h-input
        v-model="data.id"
        title="Existing Placeholder ID (11 characters)"
      >
        <template #prepend><span>ID</span></template>
        <template #append>
          <button
            class="btn-square btn"
            @click="loadExistingPlaceholder(data.id)"
          >
            <div class="i-ion:checkmark" />
          </button>
        </template>
      </h-input>
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
    <h-input
      title="Create Placeholder into Channel:"
      :error="result.$errors.find((x:any) => x.name === 'channel')?.message"
    >
      <template #input><vtuber-autocomplete v-model="data.channel" /></template>
    </h-input>
    <h-input
      v-model="data.videoTitle"
      title="Video/Event Title"
      explanation="The title of placeholder"
      :error="result.$errors.find((x:any) => x.name === 'videoTitle')?.message"
    />
    <h-input
      v-model="data.videoTitleJP"
      title="Japanese Event Title"
      explanation="(shown to users with 'Use EN Name' turned off)"
    />
    <h-input
      v-model="data.sourceUrl"
      placeholder="https://twitter.com/..."
      title="Source URL"
      explanation="Link to more detail about the event. eg. URL to twitter schedule
            post or twitch channel, or link to a concert page"
      :error="result.$errors.find((x:any) => x.name === 'sourceUrl')?.message"
    />
    <h-input
      v-model="data.thumbnail"
      placeholder="https://imgur.com/..."
      title="Thumbnail Image"
    />
    <div class="flex flex-row flex-wrap gap-4">
      <span class="inline-block flex-grow basis-60">
        <div class="form-control">
          <label class="label">
            <label class="label-text">Event Type</label>
          </label>

          <label class="radio-label">
            <input
              v-model="data.placeholderType"
              type="radio"
              name="radio-10"
              value="scheduled-yt-stream"
              class="peer radio outline outline-2 checked:bg-red-500"
            />
            <span class="label-text">Scheduled YT Stream</span>
          </label>
          <label class="radio-label">
            <input
              v-model="data.placeholderType"
              type="radio"
              name="radio-10"
              value="external-stream"
              class="peer radio outline outline-2 checked:bg-blue-500"
            />
            <span class="label-text">
              External Stream (eg. Twitch/Twitcast)
            </span>
          </label>
          <label class="radio-label">
            <input
              v-model="data.placeholderType"
              type="radio"
              name="radio-10"
              value="event"
              class="peer radio outline outline-2 checked:bg-orange-500"
            />
            <span class="label-text">Event</span>
          </label>
        </div>
      </span>
      <span class="inline-block flex-grow basis-60">
        <div class="form-control">
          <label class="label">
            <label class="label-text">Certainty</label>
          </label>
          <label class="radio-label">
            <input
              v-model="data.certainty"
              type="radio"
              name="radio-11"
              value="certain"
              class="peer radio outline outline-2 checked:bg-secondary"
            />
            <span class="label-text peer-checked:text-secondary">Certain</span>
          </label>
          <label class="radio-label">
            <input
              v-model="data.certainty"
              type="radio"
              name="radio-11"
              value="likely"
              class="peer radio outline outline-2 checked:bg-secondary"
            />
            <span class="label-text peer-checked:text-secondary">
              Likely (This is an educated guess)
            </span>
          </label>
        </div>
      </span>
    </div>

    <div class="flex flex-row justify-between">
      <div class="flex w-min flex-col gap-2">
        <h-input
          title="Timezone"
          :error="result.$errors.find((x:any) => x.name === 'time')?.message"
        >
          <template #input>
            <select
              v-model="data.timezone"
              class="select-bordered select w-full max-w-xs border-solid"
            >
              <option value="Etc/GMT" selected>UTC (+0)</option>
              <option value="Asia/Tokyo">JST (+8)</option>
              <option value="America/Los_Angeles">
                Pacific Time (PST/PDT)
              </option>
              <option value="America/New_York">
                Eastern Time (EST/EDT) (-?)
              </option>
            </select>
          </template>
        </h-input>

        <date-picker
          v-model="data.liveDate"
          mode="dateTime"
          :timezone="data.timezone"
          :is-dark="theme.dark"
          color="gray"
          class=""
          is24hr
          :min-date="minDate"
          :minute-increment="5"
          :model-config="{ type: 'string', mask: 'iso' }"
        />
        <h-input v-model="data.duration" type="number" title="Duration" />
      </div>
      <div class="form-control mx-auto hidden w-full max-w-xs lg:block">
        <label class="label"><span class="label-text">Preview:</span></label>
        <video-card
          :video="(videoObj as any)"
          include-channel
          class="max-w-xs"
        />
      </div>
    </div>
    <div class="form-control my-2 block w-full max-w-xs lg:hidden">
      <div class="divider">Preview</div>
      <video-card
        :video="(videoObj as any)"
        disable-default-click
        include-channel
        class="max-w-xs"
      />
    </div>

    <h-btn
      :class="{
        'btn-success': result.$dirty && !result.$invalid,
        'btn-disabled btn-error': result.$invalid || !result.$dirty,
      }"
      @click="onSubmit"
    >
      {{
        data.id ? "Submit Placeholder Modification" : "Create new Placeholder"
      }}
    </h-btn>
  </div>
  <!-- </v-form> -->
</template>

<script lang="ts">
import { dayjs } from "@/utils/time";
import jwtDecode from "jwt-decode";
import backendApi from "@/utils/backend-api";
import { useSiteStore } from "@/stores/site";
import "v-calendar/dist/style.css";
import { DatePicker } from "v-calendar";
import { useThemeStore } from "@/stores/theme";
import { useToast } from "vue-toast-notification";
import useValidate from "vue-tiny-validate";

export default defineComponent({
  components: {
    DatePicker,
  },
  setup() {
    const site = useSiteStore();
    const theme = useThemeStore();
    const creditName = ref(site.user?.username);
    const { open: toast } = useToast();

    const data = reactive({
      id: "",
      channel: undefined as undefined | { text: string; value: ShortChannel },
      videoTitle: "",
      videoTitleJP: "",
      sourceUrl: "",
      thumbnail: "",
      placeholderType: "scheduled-yt-stream",
      certainty: "certain",
      liveDate: dayjs().startOf("hour").toISOString(),
      timezone: "Asia/Tokyo",
      duration: 60,
    });
    const ruleset = {
      requiredRule: (v: any) => !!v,
      linkRule: (v: any) =>
        !!v.match(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
        ),
      timeRule: (v) => dayjs(v).isValid(),
    };

    const rules = reactive({
      channel: {
        name: "channel",
        test: ruleset.requiredRule,
        message: "Need channel",
      },
      videoTitle: {
        name: "videoTitle",
        test: ruleset.requiredRule,
        message: "Cannot be empty",
      },
      sourceUrl: {
        name: "sourceUrl",
        test: ruleset.linkRule,
        message: "Must be a valid URL (https://...)",
      },
      liveDate: {
        name: "time",
        test: ruleset.timeRule,
        message: "The time is not valid for some reason",
      },
    });

    const { result } = useValidate(data, rules, { autoTest: true });

    return { creditName, site, theme, toast, data, result };
  },
  data() {
    return {
      tab: 0,
      minDate: dayjs().startOf("day").subtract(1, "day").toDate(),

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
      discordCredits: undefined as any,
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
      return this.data.liveDate;
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
        title: this.data.videoTitle || "Example Title",
        placeholderType: this.data.placeholderType || "scheduled-yt-stream",
        channel: {
          id: this.data.channel?.value?.id || "ExampleIdThatDoesntExist",
          name: this.data.channel?.value?.name || "<CHANNEL>",
          english_name: this.data.channel?.value?.english_name || "<CHANNEL>",
        },
        thumbnail: this.data.thumbnail || "",
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
        link: this.data.sourceUrl,
      };
    },
  },
  watch: {
    tab(nv) {
      if (nv === 0) this.data.id = "";
    },
    channel() {
      console.log(JSON.stringify(this.data.channel));
    },
  },
  async mounted() {
    if (this.token?.link) {
      this.discordCredits = await backendApi.discordServerInfo(this.token.link);
    }
    const { id } = this.$route.query;
    if (id && this.isEditor) {
      this.data.id = id as string;
      this.loadExistingPlaceholder(this.data.id);
      this.tab = 1;
    }
  },
  methods: {
    onSubmit() {
      if (
        // this.$refs.form.validate() && (...
        this.isEditor ||
        (this.token && !this.expired)
      ) {
        const titlePayload = {
          name: this.data.videoTitle,
          ...(this.data.videoTitleJP && { jp_name: this.data.videoTitleJP }),
          link: this.data.sourceUrl,
          ...(this.data.thumbnail && { thumbnail: this.data.thumbnail }),
          placeholderType: this.data.placeholderType,
          certainty: this.data.certainty,
          credits: this.credits,
        };
        const body = {
          channel_id: this.data.channel?.value?.id,
          title: titlePayload,
          liveTime: this.availableAt,
          duration: +this.data.duration * 60, // convert min to sec
          id: undefined as string | undefined,
        };
        if (this.data.id) body.id = this.data.id;
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

      this.data.videoTitle = video.title;
      this.data.videoTitleJP = video.jp_name;
      this.data.sourceUrl = video.link;
      this.data.thumbnail = video.thumbnail;
      this.data.placeholderType = video.placeholderType;
      this.data.timezone = "Asia/Tokyo";
      const vt = dayjs(video.start_scheduled).tz(this.data.timezone);
      this.data.liveDate = vt.toISOString();
      this.data.duration = video.duration / 60;
      this.data.certainty = video.certainty;
      this.data.channel = { text: video.channel.name, value: video.channel };
    },
  },
});
</script>

<style>
.radio-label {
  @apply flex items-center gap-2 px-1 py-2;
}
</style>
