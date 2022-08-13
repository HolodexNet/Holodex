<template>
  <v-list v-if="video" dense>
    <template v-if="video.type !== 'placeholder'">
      <v-list-item target="_blank" :href="`https://youtu.be/${video.id}`" @click.stop="closeMenu()">
        <v-icon left>
          {{ icons.mdiYoutube }}
        </v-icon>
        {{ $t("views.settings.redirectModeLabel") }}
      </v-list-item>

      <v-list-item v-if="video.status === 'upcoming'" @click.prevent.stop="openGoogleCalendar(); closeMenu()">
        <v-icon left>
          {{ icons.mdiCalendar }}
        </v-icon>
        {{ $t("component.videoCard.googleCalendar") }}
      </v-list-item>
      <v-list-item :to="`/edit/video/${video.id}${video.type !== 'stream' ? '/mentions' : '/'}`">
        <v-icon left>
          {{ icons.mdiPencil }}
        </v-icon>
        {{ $t("component.videoCard.edit") }}
      </v-list-item>
      <template v-if="video.type !== 'clip'">
        <v-list-item :to="`/multiview/AAUY${video.id}%2CUAEYchat`">
          <v-icon left>
            {{ icons.mdiViewDashboard }}
          </v-icon>
          {{ $t("component.mainNav.multiview") }}
        </v-list-item>
      </template>
      <v-menu right absolute min-width="240">
        <template #activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on.stop="on">
            <v-icon left>
              {{ icons.mdiPlaylistPlus }}
            </v-icon>
            {{ $t("component.mainNav.playlist") }}
            <v-icon right>
              {{ icons.mdiChevronRight }}
            </v-icon>
          </v-list-item>
        </template>
        <video-quick-playlist :key="video.id + Date.now()" :video-id="video.id" :video="video" />
      </v-menu>
      <v-list-item :class="doneCopy ? 'green lighten-2' : ''" @click.stop="copyLink(); closeMenu()">
        <v-icon left>
          {{ icons.mdiClipboardPlusOutline }}
        </v-icon>
        {{ $t("component.videoCard.copyLink") }}
      </v-list-item>
    </template>
    <template v-else>
      <v-list-item v-if="video.status === 'upcoming'" @click.prevent.stop="openGoogleCalendar(); closeMenu()">
        <v-icon left>
          {{ icons.mdiCalendar }}
        </v-icon>
        {{ $t("component.videoCard.googleCalendar") }}
      </v-list-item>
    </template>
    <v-list-item @click="openTlClient(); closeMenu()">
      <v-icon left>
        {{ icons.mdiTypewriter }}
      </v-icon>
      {{ isLive || video.status === 'upcoming' ? $t("component.videoCard.openClient") :
        $t("component.videoCard.openScriptEditor")
      }}
    </v-list-item>
    <v-list-item v-if="isPast" @click="scriptUploadPanel(); closeMenu()">
      <v-icon left>
        {{ icons.mdiClipboardArrowUpOutline }}
      </v-icon>
      {{ $t("component.videoCard.uploadScript") }}
    </v-list-item>
    <v-list-item @click="$store.commit('setReportVideo', video); closeMenu()">
      <v-icon left>
        {{ icons.mdiFlag }}
      </v-icon>
      {{ $t("component.reportDialog.title") }}
    </v-list-item>

    <template v-if="$store.getters['isSuperuser']">
      <!-- <v-list-item> -->
      <v-lazy>
        <watch-quick-editor :video="video" />
      </v-lazy>
      <!-- </v-list-item> -->
    </template>
  </v-list>
</template>

<script>
import { dayjs } from "@/utils/time";
import copyToClipboard from "@/mixins/copyToClipboard";
import VideoQuickPlaylist from "@/components/playlist/VideoQuickPlaylist.vue";

export default {
    components: {
        WatchQuickEditor: () => import("@/components/watch/WatchQuickEditor.vue"),
        VideoQuickPlaylist,
    },
    mixins: [copyToClipboard],
    props: {
        video: {
            type: Object,
            required: true,
        },
    },
    computed: {
        isLive() {
            if (!this.video) {
                return false;
            }
            if (this.video.status === "past") {
                return false;
            }
            if ((this.video.status === "live") || (Date.parse(this.video.start_scheduled) < Date.now())) {
                return true;
            }
            return false;
        },
        isPast() {
            if (!this.video) {
                return false;
            }
            if (this.video.status === "past") {
                return true;
            }
            return false;
        },
    },
    methods: {
        // Open google calendar to add the time specified in the element
        // Uses UTC time since the calendar may be in a different time zone
        openGoogleCalendar() {
            const startdate = this.video.start_scheduled;
            const baseurl = "https://www.google.com/calendar/render?action=TEMPLATE&text=";
            const videoTitle = encodeURIComponent(this.video.title);
            const googleCalendarFormat = "YYYYMMDD[T]HHmmss[Z]"; // "Z" suffix for UTC time
            const eventStart = dayjs.utc(startdate).format(googleCalendarFormat);
            const eventEnd = dayjs.utc(startdate).add(1, "hour").format(googleCalendarFormat);
            const details = `<a href="${window.origin}/watch/${this.video.id}">Open Video</a>`;
            window.open(baseurl.concat(videoTitle, "&dates=", eventStart, "/", eventEnd, "&details=", details), "_blank");
        },
        copyLink() {
            const link = `${window.origin}/watch/${this.video.id}`;
            this.copyToClipboard(link);
        },
        closeMenu() {
            this.$emit("closeMenu");
        },
        openTlClient() {
            if (this.$store.state.userdata?.user) {
                if (this.isLive || this.video.status === "upcoming") {
                    this.$router.push({ path: "/tlclient", query: { video: this.video.type === "placeholder" ? this.video.link : `YT_${this.video.id}` } });
                } else {
                    this.$router.push({ path: "/scripteditor", query: { video: `YT_${this.video.id}` } });
                }
            } else {
                this.$router.push({ path: "/login" });
            }
        },
        scriptUploadPanel() {
            if (this.$store.state.userdata?.user) {
                this.$store.commit("setUploadPanel", true);
            } else {
                this.$router.push({ path: "/login" });
            }
        },
    },
};
</script>

<style>
</style>
