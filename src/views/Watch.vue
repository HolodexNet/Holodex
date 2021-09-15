<template>
  <LoadingOverlay
    v-if="isLoading || hasError"
    :is-loading="isLoading"
    :show-error="hasError"
  />
  <div
    v-else
    ref="watchFullscreen"
    style="overflow-y: auto"
    :style="{
      'overflow-y':
        showChatWindow && isMobile && !landscape ? 'hidden' : 'auto',
      'max-height': showChatWindow && isMobile && !landscape ? '100vh' : '',
    }"
  >
    <!-- Mugen info message -->
    <v-alert
      v-if="isMugen"
      v-model="firstVisitMugen"
      dense
      text
      type="info"
      dismissible
    >
      {{ $t("views.mugen.welcome") }}
    </v-alert>

    <div
      class="d-flex flex-column pa-md-3"
      :class="{
        'flex-nowrap': !theaterMode,
        'flex-sm-row': !theaterMode,
      }"
    >
      <div
        class="d-inline-flex flex-shrink-1 flex-column py-0 pl-0"
        :md="theaterMode ? 12 : 9"
        :style="{
          'padding-right':
            isMobile && showChatWindow && landscape ? '220px' : 0,
          width: '100%',
        }"
      >
        <WatchFrame :video="video" :fluid="isMobile">
          <template #youtube>
            <youtube
              v-if="video.id"
              :video-id="video.id"
              :player-vars="{
                ...(timeOffset && { start: timeOffset }),
                autoplay: isMugen || isPlaylist ? 1 : 0,
                playsinline: 1,
              }"
              @ready="ready"
              @playing="playing"
              @ended="ended"
              v-on="!hasLiveChat && { currentTime: handleCurrentTime }"
            />
          </template>
        </WatchFrame>
        <WatchHighlights
          v-if="comments.length && !theaterMode"
          key="highlights"
          :comments="comments"
          :video="video"
          :limit="isMobile ? 5 : 0"
          @timeJump="seekTo"
        />
        <WatchToolBar :video="video" :no-back-button="!isMobile">
          <template #buttons>
            <v-tooltip v-if="hasLiveTL" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  :color="showTL ? 'primary' : ''"
                  v-bind="attrs"
                  @click="showTL = !showTL"
                  v-on="on"
                >
                  <v-icon>
                    {{ icons.tlChat }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{
                showTL
                  ? $t("views.watch.chat.hideTLBtn")
                  : $t("views.watch.chat.showTLBtn")
              }}</span>
            </v-tooltip>
            <v-btn
              v-if="hasLiveChat"
              icon
              lg
              :color="showLiveChat ? 'primary' : ''"
              @click="showLiveChat = !showLiveChat"
            >
              <v-icon>
                {{ icons.ytChat }}
              </v-icon>
            </v-btn>
            <v-btn icon lg @click="toggleFullScreen">
              <v-icon>{{ icons.mdiFullscreen }}</v-icon>
            </v-btn>
            <v-tooltip v-if="!isMobile" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  :color="theaterMode ? 'primary' : ''"
                  v-bind="attrs"
                  @click="theaterMode = !theaterMode"
                  v-on="on"
                >
                  <v-icon>{{ mdiRectangleOutline }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.watch.theaterMode") }}</span>
            </v-tooltip>
          </template>
        </WatchToolBar>
        <WatchInfo
          v-if="!theaterMode"
          key="info"
          :video="video"
          @timeJump="seekTo"
        />
        <WatchQuickEditor
          v-if="!theaterMode && (role === 'admin' || role === 'editor')"
          :video="video"
        />
        <WatchPlaylist
          v-if="isMobile"
          v-model="playlistIndex"
          @playNext="playNextPlaylist"
        />
        <!-- Mobile mode only sidebar -->
        <WatchSideBar v-if="isMobile" :video="video" @timeJump="seekTo" />
        <!-- Mobile mode Mugen -->
        <WatchMugen v-if="isMugen && isMobile" @playNext="playNextMugen" />
        <WatchComments
          v-if="comments.length && !theaterMode"
          key="comments"
          :comments="comments"
          :video="video"
          :limit="isMobile ? 5 : 0"
          @timeJump="seekTo"
        />
      </div>
      <div
        class="related-videos pt-0 row ma-0"
        :class="{ 'sidebar-width': !isMobile && !theaterMode }"
      >
        <v-col
          v-if="theaterMode"
          md="8"
          lg="9"
          class="pa-0"
        >
          <WatchInfo key="info" :video="video" @timeJump="seekTo" />
          <WatchQuickEditor
            v-if="role === 'admin' || role === 'editor'"
            :video="video"
          />
          <v-divider />
          <WatchComments
            v-if="comments.length"
            key="comments"
            :comments="comments"
            :video="video"
            :limit="isMobile ? 5 : 0"
            @timeJump="seekTo"
          />
        </v-col>
        <v-col
          :md="theaterMode ? 4 : 12"
          :lg="theaterMode ? 3 : 12"
          class="py-0 pr-0 pl-0 pl-md-3"
        >
          <WatchLiveChat
            v-if="showChatWindow"
            v-model="chatStatus"
            :video="video"
            :fixed-right="isMobile && landscape"
            :fixed-bottom="isMobile && !landscape"
            :current-time="currentTime"
            @videoUpdate="handleVideoUpdate"
            @timeJump="seekTo"
          />
          <template v-if="!isMobile">
            <WatchPlaylist
              v-model="playlistIndex"
              @playNext="playNextPlaylist"
            />
            <WatchMugen v-if="isMugen" @playNext="playNextMugen" />
            <WatchSideBar :video="video" @timeJump="seekTo" />
          </template>
        </v-col>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Youtube from "@/components/player/YoutubePlayer.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import WatchInfo from "@/components/watch/WatchInfo.vue";
import WatchFrame from "@/components/watch/WatchFrame.vue";
import WatchSideBar from "@/components/watch/WatchSideBar.vue";
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import WatchComments from "@/components/watch/WatchComments.vue";
import WatchHighlights from "@/components/watch/WatchHighlights.vue";
import WatchToolBar from "@/components/watch/WatchToolbar.vue";
import WatchQuickEditor from "@/components/watch/WatchQuickEditor.vue";

import { decodeHTMLEntities, syncState } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiRectangleOutline } from "@mdi/js";

export default {
    name: "Watch",
    metaInfo() {
        return {
            title: this.title,
        };
    },
    components: {
        Youtube,
        LoadingOverlay,
        WatchInfo,
        WatchFrame,
        WatchLiveChat,
        WatchSideBar,
        WatchComments,
        WatchHighlights,
        WatchToolBar,
        WatchQuickEditor,
        WatchMugen: () => import("@/components/watch/WatchMugen.vue"),
        WatchPlaylist: () => import("@/components/watch/WatchPlaylist.vue"),
    },
    data() {
        return {
            startTime: 0,
            mdiOpenInNew,
            mdiRectangleOutline,
            fullScreen: false,
            playlistIndex: -1,
            currentTime: 0,
            player: null,
        };
    },
    computed: {
        ...mapState("watch", ["video", "isLoading", "hasError"]),
        ...syncState("watch", ["showTL", "showLiveChat"]),
        chatStatus: {
            get() {
                return {
                    showTlChat: this.showTL,
                    showYtChat: this.showLiveChat && this.hasLiveChat,
                };
            },
            set(val: any) {
                this.showTL = val.showTlChat;
                this.showLiveChat = val.showYtChat;
            },
        },
        videoId() {
            return this.$route.params.id || this.$route.query.v;
        },
        timeOffset() {
            return +this.$route.query.t || this.startTime;
        },
        title() {
            return (this.video.title && decodeHTMLEntities(this.video.title)) || "";
        },
        hasLiveChat() {
            // live chat exits for live/upcoming streams
            return (
                this.video.type === "stream"
                && ["upcoming", "live"].includes(this.video.status)
            );
        },
        hasLiveTL() {
            return this.video.type === "stream";
        },
        showChatWindow() {
            return (
                (this.hasLiveChat && this.showLiveChat)
                || (this.showTL && this.hasLiveTL)
            );
        },
        isMugen() {
            return this.$route.name === "mugen-clips";
        },
        isMobile() {
            return this.$store.state.isMobile;
        },
        landscape() {
            return this.$vuetify.breakpoint.width >= 568;
        },
        theaterMode: {
            get() {
                return this.$store.state.watch.theaterMode && !this.isMobile;
            },
            set(val) {
                return this.$store.commit("watch/setTheaterMode", val);
            },
        },
        firstVisitMugen: {
            get() {
                return this.$store.state.firstVisitMugen;
            },
            set() {
                return this.$store.commit("setVisitedMugen");
            },
        },
        comments() {
            return this.video.comments || [];
        },
        isPlaylist() {
            return this.$route.query.playlist;
        },
        role() {
            return this.$store.state.userdata?.user?.role;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.params.id": function () {
            this.init();
        },
        // eslint-disable-next-line func-names
        "$route.query.v": function () {
            this.init();
        },
    },
    created() {
        this.init();
        if (this.showTL && !this.hintConnectLiveTL) {
            this.hintConnectLiveTL = true;
        }
    },
    methods: {
        init() {
            window.scrollTo(0, 0);
            this.startTime = 0;
            if (this.isMugen) {
                this.initMugen();
                return;
            }
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/setId", this.videoId);
            this.$store.dispatch("watch/fetchVideo").then(() => {
                this.$store.dispatch("history/addWatchedVideo", this.video);
                // Check if there's at least 10 liveTls and open the tl panel
                if (
                    this.video?.live_tl_count?.[this.$store.state.settings.liveTlLang]
                    > 10
                ) {
                    this.showTL = true;
                }
            });
        },
        initMugen() {
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/fetchEnd");
        },
        ready(event) {
            this.player = event;
        },
        playing() {
            this.$gtag.event("start/resume", {
                event_category: "video",
                event_label: this.video.type,
            });
        },
        seekTo(time) {
            if (!this.player) return;
            window.scrollTo(0, 0);
            this.player.seekTo(time);
            this.player.playVideo();
        },
        playNextMugen({ video, timeOffset = 0 }) {
            this.$gtag.event("mugen-next", {
                event_category: "video",
            });
            this.$store.commit("watch/setVideo", video);
            this.startTime = timeOffset;
        },
        playNextPlaylist({ video }) {
            this.$gtag.event("playlist-next", {
                event_category: "video",
                event_label: video.type || "untyped",
            });
            this.$router.push({
                path: `/watch/${video.id}`,
                query: {
                    playlist: this.$route.query.playlist,
                },
            });
        },
        handleVideoUpdate(update) {
            this.video.live_viewers = update.live_viewers;
            this.video.status = update.status;
            this.video.start_actual = update.start_actual;
        },
        handleCurrentTime(time) {
            this.currentTime = time;
        },
        toggleFullScreen() {
            if (!document.fullscreenElement) {
                this.fullScreen = true;
                this.$refs.watchFullscreen.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
                this.fullScreen = false;
            }
        },
        ended() {
            // if playlistIndex is set to -1 we aren't playing playlists.
            if (this.playlistIndex >= 0) {
                this.playlistIndex += 1;
            }
        },
    },
};
</script>

<style>
div.notification-sticker {
  position: absolute;
  top: 1px;
  right: 2px;
  border-radius: 4px;
  width: 8px;
  height: 8px;
  background-color: rgb(230, 33, 23);
}

.sidebar-width {
  flex: 0 0 25%;
  max-width: 25%;
  min-width: 324px;
}

.min-sidebar-width {
  min-width: 320px;
}
</style>
