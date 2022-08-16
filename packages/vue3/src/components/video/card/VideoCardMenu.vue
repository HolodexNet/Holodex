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
        :class="`my-2 border-none btn-outline btn-ghost btn btn-circle btn-sm ${btnClass}`"
        v-bind="props"
        @click.stop.prevent
      >
        <v-icon size="large">
          {{ icons.mdiDotsVertical }}
        </v-icon>
      </label>
    </template>
    <v-sheet>
      <ul class="p-2 overflow-y-auto menu bg-bgColor-500 text-base-content">
        <!-- Real Videos -->
        <template v-if="video.type !== 'placeholder'">
          <li>
            <a
              :href="`https://youtu.be/${video.id}`"
              target="_blank"
              @click.stop="closeMenu()"
            >
              <v-icon left>
                {{ icons.mdiYoutube }}
              </v-icon>
              {{ $t("views.settings.redirectModeLabel") }}
            </a>
          </li>
          <li v-if="video.status === 'upcoming'">
            <a
              @click.prevent.stop="
                openGoogleCalendar();
                closeMenu();
              "
            >
              <v-icon left>
                {{ icons.mdiCalendar }}
              </v-icon>
              {{ $t("component.videoCard.googleCalendar") }}
            </a>
          </li>
          <li>
            <router-link
              :to="`/edit/video/${video.id}${
                video.type !== 'stream' ? '/mentions' : '/'
              }`"
            >
              <v-icon left>
                {{ icons.mdiPencil }}
              </v-icon>
              {{ $t("component.videoCard.edit") }}
            </router-link>
          </li>
          <li v-if="video.type !== 'clip'">
            <router-link :to="`/multiview/AAUY${video.id}%2CUAEYchat`">
              <v-icon left>
                {{ icons.mdiViewDashboard }}
              </v-icon>
              {{ $t("component.mainNav.multiview") }}
            </router-link>
          </li>
          <li>
            <v-menu right absolute min-width="240">
              <template #activator="{ props }">
                <a v-bind="props">
                  <v-icon left>
                    {{ icons.mdiPlaylistPlus }}
                  </v-icon>
                  {{ $t("component.mainNav.playlist") }}
                  <v-icon right class="ml-auto mr-0">
                    {{ icons.mdiChevronRight }}
                  </v-icon>
                </a>
              </template>
              <!-- <video-quick-playlist :key="video.id+Date.now()" :video-id="video.id" :video="video" /> -->
            </v-menu>
          </li>
          <!-- <li>
            <a>
              <v-icon left>
                {{ icons.mdiClipboardPlusOutline }}
              </v-icon>
              {{ $t("component.videoCard.copyLink") }}
            </a>
          </li> -->
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
            <v-icon left>
              {{ icons.mdiTypewriter }}
            </v-icon>
            {{
              ["live", "upcoming"].includes(video.status)
                ? $t("component.videoCard.openClient")
                : $t("component.videoCard.openScriptEditor")
            }}
          </a>
        </li>
        <li v-if="video.status === 'past'">
          <a>
            <v-icon left>
              {{ icons.mdiClipboardArrowUpOutline }}
            </v-icon>
            {{ $t("component.videoCard.uploadScript") }}
          </a>
        </li>
        <li>
          <a>
            <v-icon left>
              {{ icons.mdiFlag }}
            </v-icon>
            {{ $t("component.reportDialog.title") }}
          </a>
        </li>
      </ul>
    </v-sheet>
  </v-menu>
</template>
<script lang="ts">
import { formatDuration } from "@/utils/time";
import { useClipboard, useNow } from "@vueuse/core";
import dayjs from "dayjs";
import { PropType } from "vue";
import { useI18n } from "vue-i18n";

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
    return { showMenu, clipboard };
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
</style>
