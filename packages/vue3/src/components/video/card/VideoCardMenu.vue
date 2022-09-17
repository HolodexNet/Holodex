<template>
  <v-menu
    v-model="showMenu"
    location="bottom end"
    :close-on-content-click="false"
    transition="slide-y-transition"
  >
    <template #activator="{ props }">
      <label
        tabindex="0"
        :class="`video-menu-default-activator my-2 btn hover:bg-opacity-50 active:bg-opacity-50 bg-opacity-0 ${btnClass}`"
        v-bind="props"
        @click.stop.prevent
      >
        <div :class="icons.more" class="text-lg"></div>
      </label>
    </template>
    <v-sheet>
      <ul
        class="p-2 overflow-y-auto menu video-menu bg-bgColor-500 text-base-content"
      >
        <!-- Real Videos -->
        <template v-if="video.type !== 'placeholder'">
          <li>
            <a
              :href="`https://youtu.be/${video.id}`"
              target="_blank"
              @click.stop="closeMenu()"
            >
              <div :class="icons.youtube"></div>
              {{ $t("views.settings.redirectModeLabel") }}
            </a>
          </li>
          <li>
            <a
              @click.stop="
                closeMenu();
                selection.selectionMode = true;
                selection.selectedVideos = [video];
              "
            >
              <div class="i-material-symbols:fact-check"></div>
              {{ "Select" }}
            </a>
          </li>

          <li v-if="video.status === 'upcoming'">
            <a
              @click.prevent.stop="
                openGoogleCalendar();
                closeMenu();
              "
            >
              <div :class="icons.gcal"></div>
              {{ $t("component.videoCard.googleCalendar") }}
            </a>
          </li>
          <li>
            <router-link
              :to="`/edit/video/${video.id}${
                video.type !== 'stream' ? '/mentions' : '/'
              }`"
            >
              <div :class="icons.edit"></div>
              {{ $t("component.videoCard.edit") }}
            </router-link>
          </li>
          <li v-if="video.type !== 'clip'">
            <router-link :to="`/multiview/AAUY${video.id}%2CUAEYchat`">
              <div class="i-clarity:grid-chart-solid"></div>
              {{ $t("component.mainNav.multiview") }}
            </router-link>
          </li>
          <li>
            <v-menu right absolute min-width="240">
              <template #activator="{ props }">
                <a v-bind="props">
                  <div :class="icons.listPlus"></div>
                  {{ $t("component.mainNav.playlist") }}
                  <v-icon right class="ml-auto mr-0">
                    {{ icons.mdiChevronRight }}
                  </v-icon>
                </a>
              </template>
              <!-- <video-quick-playlist :key="video.id+Date.now()" :video-id="video.id" :video="video" /> -->
            </v-menu>
          </li>
          <li>
            <a>
              <div class="i-fluent:clipboard-link-20-filled"></div>
              {{ $t("component.videoCard.copyLink") }}
            </a>
          </li>
        </template>
        <template v-else>
          <v-list-item
            v-if="video.status === 'upcoming'"
            @click.prevent.stop="
              openGoogleCalendar();
              closeMenu();
            "
          >
            <v-icon left>
              {{ icons.mdiCalendar }}
            </v-icon>
            {{ $t("component.videoCard.googleCalendar") }}
          </v-list-item>
        </template>

        <li>
          <a>
            <div class="i-mdi:script-text"></div>
            {{
              ["live", "upcoming"].includes(video.status)
                ? $t("component.videoCard.openClient")
                : $t("component.videoCard.openScriptEditor")
            }}
          </a>
        </li>
        <li v-if="video.status === 'past'">
          <a>
            <div class="i-majesticons:cloud-upload-line"></div>
            {{ $t("component.videoCard.uploadScript") }}
          </a>
        </li>
        <li>
          <a
            @click="
              () => {
                report.reportedVideo.value = video;
                showMenu = false;
              }
            "
          >
            <div class="i-material-symbols:flag-rounded"></div>
            {{ $t("component.reportDialog.title") }}
          </a>
        </li>
      </ul>
    </v-sheet>
  </v-menu>
</template>
<script lang="ts">
import { useGlobalReportState } from "@/stores/report";
import { useVideoSelection } from "@/stores/selection";
// import { formatDuration } from "@/utils/time";
import { useClipboard } from "@vueuse/core";
import dayjs from "dayjs";
import { PropType } from "vue";
// import { useI18n } from "vue-i18n";

export default defineComponent({
  props: {
    video: {
      type: Object as PropType<Video>,
      required: true,
    },
    btnClass: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const showMenu = ref(false);
    const clipboard = useClipboard();
    const report = useGlobalReportState();
    const selection = useVideoSelection();
    return { showMenu, clipboard, report, selection };
    // const now = useNow({ interval: 1000 })
    // const {t} = useI18n();

    // const formatted = computed(() => {
    //     if (props.video.start_actual && props.video.status === "live") {
    //         return formatDuration(
    //             dayjs(now.value).diff(dayjs(props.video.start_actual)),
    //         );
    //     }
    //     if (props.video.status === "upcoming" && props.video.duration) {
    //         return t("component.videoCard.premiere");
    //     }
    //     return (
    //         props.video.duration && formatDuration(props.video.duration * 1000)
    //     );
    // })

    // return {formatted}
  },
  methods: {
    // Open google calendar to add the time specified in the element
    // Uses UTC time since the calendar may be in a different time zone
    openGoogleCalendar() {
      const startdate = this.video.start_scheduled;
      const baseurl =
        "https://www.google.com/calendar/render?action=TEMPLATE&text=";
      const videoTitle = encodeURIComponent(this.video.title);
      const googleCalendarFormat = "YYYYMMDD[T]HHmmss[Z]"; // "Z" suffix for UTC time
      const eventStart = dayjs.utc(startdate).format(googleCalendarFormat);
      const eventEnd = dayjs
        .utc(startdate)
        .add(1, "hour")
        .format(googleCalendarFormat);
      const details = `<a href="${window.origin}/watch/${this.video.id}">Open Video</a>`;
      window.open(
        baseurl.concat(
          videoTitle,
          "&dates=",
          eventStart,
          "/",
          eventEnd,
          "&details=",
          details
        ),
        "_blank"
      );
    },
    copyLink() {
      const link = `${window.origin}/watch/${this.video.id}`;
      this.clipboard.copy(link);
    },
    closeMenu() {
      this.showMenu = false;
    },
    // openTlClient() {
    //     if (this.$store.state.userdata?.user) {
    //         if (this.isLive) {
    //             this.$router.push({ path: "/tlclient", query: { video: `YT_${this.video.id}` } });
    //         } else {
    //             this.$router.push({ path: "/scripteditor", query: { video: `YT_${this.video.id}` } });
    //         }
    //     } else {
    //         this.$router.push({ path: "/login" });
    //     }
    // },
    // scriptUploadPanel() {
    //     if (this.$store.state.userdata?.user) {
    //         this.$store.commit("setUploadPanel", true);
    //     } else {
    //         this.$router.push({ path: "/login" });
    //     }
    // },
  },
});
</script>
<style lang="scss">
.video-card-menu {
  position: absolute;
  right: 0px;
  display: inline-block;
  top: 5px;
  z-index: 1;
}
.video-menu-default-activator.btn {
  --tw-text-opacity: 1;
  border-radius: 9999px;
  border-style: none;
  color: hsl(var(--bc) / var(--tw-text-opacity));
  font-size: 0.875rem;
  height: 2rem;
  min-height: 2rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding: 0px;
  width: 2rem;
}
.video-card:focus-within .video-menu-default-activator {
  --tw-bg-opacity: 0.5;
}
@media (hover: hover) and (min-width: 768px) {
  .video-menu-default-activator {
    width: 1.25rem !important;
  }
}
.video-menu li a div {
  font-size: 18px;
}
</style>
