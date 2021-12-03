<template>
  <LoadingOverlay
    v-if="isLoading || hasError"
    :is-loading="isLoading"
    :show-error="hasError"
  />
  <div
    v-else
    class="d-flex flex-row watch-layout"
    :class="{
      'mobile': isMobile,
      'theater-mode': theaterMode || $vuetify.breakpoint.mdAndDown
    }"
  >
    <div
      class="d-flex flex-grow-1 left"
    >
      <div class="d-flex sidebar flex-column">
        <WatchMentions v-if="video.mentions && video.mentions.length" :video="video" />
        <!-- <WatchQuickEditor
          v-if="role === 'admin' || role === 'editor'"
          :video="video"
        /> -->
        <WatchPlaylist
          v-model="playlistIndex"
          @playNext="playNextPlaylist"
        />
        <WatchMugen v-if="isMugen && isMobile" @playNext="playNextMugen" />
        <WatchSideBar :video="video" @timeJump="seekTo" />
      </div>
      <div class="d-flex flex-column flex-grow-1">
        <youtube
          v-if="video.id"
          ref="ytPlayer"
          class="video"
          :video-id="video.id"
          :player-vars="{
            ...(timeOffset && { start: timeOffset }),
            autoplay: isMugen || isPlaylist ? 1 : 0,
            playsinline: 1,
          }"
          @ready="ready"
          @playing="playing"
          @ended="ended"
          v-on="video.type === 'stream' && video.status === 'past' && { currentTime: handleCurrentTime }"
        />
        <WatchHighlights
          v-if="comments.length && (!isMobile || !showTL)"
          key="highlights"
          :comments="comments"
          :video="video"
          :limit="isMobile ? 5 : 0"
          @timeJump="seekTo"
        />
        <WatchToolBar :video="video" :no-back-button="!isMobile">
          <template #buttons>
            <v-tooltip v-if="hasExtension" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  v-bind="attrs"
                  @click="like()"
                  v-on="on"
                >
                  <v-icon>
                    {{ mdiThumbUp }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.watch.likeOnYoutube") }}</span>
            </v-tooltip>
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
                  <v-icon>{{ mdiDockRight }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.watch.theaterMode") }}</span>
            </v-tooltip>
          </template>
        </WatchToolBar>
        <WatchInfo key="info" :video="video" @timeJump="seekTo" />
        <v-lazy>
          <WatchComments
            v-if="comments.length && !theaterMode"
            key="comments"
            :comments="comments"
            :video="video"
            :limit="isMobile ? 5 : 0"
            @timeJump="seekTo"
          />
        </v-lazy>
      </div>
    </div>
    <WatchLiveChat
      v-if="!isMugen && showChatWindow"
      v-model="chatStatus"
      class="sidebar chat d-flex flex-column"
      :video="video"
      :current-time="currentTime"
      @videoUpdate="handleVideoUpdate"
      @timeJump="seekTo"
    />
  </div>
</template>

<script lang="ts">
import Youtube from "@/components/player/YoutubePlayer.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import WatchInfo from "@/components/watch/WatchInfo.vue";
// import WatchFrame from "@/components/watch/WatchFrame.vue";
import WatchSideBar from "@/components/watch/WatchSideBar.vue";
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import WatchMentions from "@/components/watch/WatchMentions.vue";
import WatchHighlights from "@/components/watch/WatchHighlights.vue";
import WatchToolBar from "@/components/watch/WatchToolbar.vue";
import WatchQuickEditor from "@/components/watch/WatchQuickEditor.vue";
import WatchComments from "@/components/watch/WatchComments.vue";
import { decodeHTMLEntities, syncState } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiDockRight, mdiThumbUp } from "@mdi/js";

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
        // WatchFrame,
        WatchLiveChat,
        WatchSideBar,
        WatchMentions,
        WatchHighlights,
        WatchToolBar,
        WatchQuickEditor,
        WatchComments,
        WatchMugen: () => import("@/components/watch/WatchMugen.vue"),
        WatchPlaylist: () => import("@/components/watch/WatchPlaylist.vue"),
    },
    data() {
        return {
            startTime: 0,
            mdiOpenInNew,
            mdiDockRight,
            mdiThumbUp,
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
            return this.video.type === "stream" && (
                ["upcoming", "live"].includes(this.video.status)
                || (this.video.status === "past" && !this.isMobile)
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
        hasExtension() {
            // @ts-ignore
            return !!window.HOLODEX_PLUS_INSTALLED;
        },
        isIOS() {
            return (
                ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
                    navigator.platform,
                )
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            );
        },
        chatStyle() {
            return {
                // position: "sticky",
                top: this.isMobile ? "0" : "56px",
                height: `calc(100vh - ${this.isMobile ? "0px" : "56px"})`,
            };
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
        ended() {
            // if playlistIndex is set to -1 we aren't playing playlists.
            if (this.playlistIndex >= 0) {
                this.playlistIndex += 1;
            }
        },
        like() {
            this.$refs?.ytPlayer?.sendLikeEvent();
        },
    },
};
</script>

<style lang="scss">
.video {
    position: relative;
    padding-bottom: 56.25%;
    padding-bottom: min(56.25%, calc(100vh - 92px));
    width: 100%;
}

.video > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}

.sidebar {
  flex-basis: 340px;
  width: 100%;
  min-width: 340px;
}

.watch-layout {
  .left {
    height: calc(100vh - 56px);
    overflow-y: auto;
    scrollbar-width: none;
  }

  .left::-webkit-scrollbar {
    display: none;
  }

  &.mobile .left {
    height: 100vh;
  }

  &.theater-mode .left .sidebar {
    order: 2;
  }

  &.theater-mode .left {
    flex-direction: column;
  }
  /* mobile TL overlay */

  // Mobile mode tl should overlay on top
  &.mobile .chat .tl-overlay {
    width: 100%;
    position: absolute;
    z-index: 3;
    top: 0;
  }

  // Mobile mode height is 100% with tl overlay
  &.mobile .chat .embedded-chat {
    height: 100% !important;
  }
  &.mobile .chat .tl-overlay {
    height: 50%;
  }

  // Stick bottom setting for tl overlay
  &.mobile .chat .tl-overlay.stick-bottom {
    bottom: 0;
    top: initial;
  }
  /* END  mobile TL overlay */

  @media (orientation: landscape) {
    .chat {
      position: sticky;
      top: 0px;
      height: calc(100vh - 56px);
    }

    &.mobile .chat {
      min-width: 220px !important;
      height: 100vh;
    }

    &.mobile .chat > .embedded-chat > iframe {
      transform: scale(0.75);
      transform-origin: top left;
      height: 133%;
      width: 133%;
    }
  }

  @media (orientation: portrait) {
    // Default portrait mode position/height for desktop
    .chat {
      position: fixed;
      bottom: 0px;
      width: 100%;
      z-index: 10;
      padding-bottom: 0;
      padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);

      height: calc(100% - 36px - 56px - 100vw * 0.5625);
      /* iOS 11.2 and later */
      height: calc((100% - 36px - 56px - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    }

    // Mobile has no top nav, update height calc
    &.mobile .chat {
      height: calc(100% - 36px - 100vw * 0.5625);
      /* iOS 11.2 and later */
      height: calc((100% - 36px - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    }
  }
}
</style>
