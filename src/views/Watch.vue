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
      'theater-mode': video.type === 'stream' || $vuetify.breakpoint.mdAndDown,
      'show-chat': showChatWindow,
      'full-height': theaterMode,
      'show-highlights-bar': showHighlightsBar,
      'flex-row-reverse': watchViewReversed,
    }"
  >
    <KeyPress
      key-event="keyup"
      :key-code="84"
      :modifiers="['altKey']"
      :prevent-default="true"
      @success="toggleTheaterMode"
    />
    <div ref="watchLayout" class="d-flex flex-grow-1 left">
      <div class="d-flex flex-column flex-grow-1">
        <div style="position: relative">
          <youtube
            v-if="video.id"
            ref="ytPlayer"
            class="video"
            :video-id="video.id"
            :player-vars="{
              ...(timeOffset && { start: timeOffset }),
              autoplay: isPlaylist ? 1 : 0,
              playsinline: 1,
              cc_lang_pref: getLang,
            }"
            @ready="ready"
            @playing="playing"
            @ended="ended"
            @currentTime="handleCurrentTime"
          />
          <!-- <WatchVideoOverlay :video="video" /> -->
          <portal-target :name="`${video.id}-overlay`" style="font-size: 16px; font-size: max(1.5vw, 16px);" />
        </div>
        <WatchHighlights
          v-if="showHighlightsBar"
          key="highlights"
          :comments="comments"
          :video="video"
          :limit="isMobile ? 8 : 0"
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
            <v-tooltip v-if="!isMobile" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  :color="theaterMode ? 'primary' : ''"
                  v-bind="attrs"
                  @click="toggleTheaterMode"
                  v-on="on"
                >
                  <v-icon>{{ mdiDockLeft }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.watch.theaterMode") }}</span>
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
          </template>
        </WatchToolBar>
        <WatchInfo key="info" :video="video" @timeJump="seekTo" />
        <v-lazy v-if="comments.length">
          <WatchComments
            key="comments"
            :comments="comments"
            :video="video"
            :limit="isMobile ? 5 : 0"
            @timeJump="seekTo"
          />
        </v-lazy>
      </div>

      <div class="d-flex sidebar flex-column">
        <WatchQuickEditor
          v-if="role === 'admin' || role === 'editor'"
          :video="video"
        />
        <!-- <WatchMentions v-if="video.mentions && video.mentions.length" :video="video" /> -->
        <WatchPlaylist
          v-model="playlistIndex"
          @playNext="playNextPlaylist"
        />
        <WatchSideBar :video="video" @timeJump="seekTo" />
      </div>
    </div>
    <WatchLiveChat
      v-if="showChatWindow"
      v-model="chatStatus"
      class="sidebar chat"
      :video="video"
      :current-time="currentTime"
      @videoUpdate="handleVideoUpdate"
      @timeJump="seekTo"
    />
    <v-dialog
      v-model="showUpload"
      max-width="80%"
      max-height="500px"
      @click:outside="$store.commit('setUploadPanel', false);"
    >
      <v-card elevation="5">
        <UploadScript :video-data="video" @close="$store.commit('setUploadPanel', false);" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Youtube from "@/components/player/YoutubePlayer.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import WatchInfo from "@/components/watch/WatchInfo.vue";
import WatchSideBar from "@/components/watch/WatchSideBar.vue";
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";
import WatchHighlights from "@/components/watch/WatchHighlights.vue";
import WatchToolBar from "@/components/watch/WatchToolbar.vue";
import WatchComments from "@/components/watch/WatchComments.vue";
import UploadScript from "@/components/tlscriptmanager/UploadScript.vue";
import { decodeHTMLEntities, syncState, getYTLangFromState } from "@/utils/functions";
import { mapState } from "vuex";
import { mdiOpenInNew, mdiDockLeft, mdiThumbUp } from "@mdi/js";

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
        WatchLiveChat,
        WatchSideBar,
        WatchHighlights,
        WatchToolBar,
        WatchComments,
        UploadScript,
        WatchQuickEditor: () => import("@/components/watch/WatchQuickEditor.vue"),
        WatchPlaylist: () => import("@/components/watch/WatchPlaylist.vue"),
        KeyPress: () => import("vue-keypress"),
    },
    data() {
        return {
            startTime: 0,
            mdiOpenInNew,
            mdiDockLeft,
            mdiThumbUp,
            playlistIndex: -1,
            currentTime: 0,
            player: null,
        };
    },
    computed: {
        ...mapState("watch", ["video", "isLoading", "hasError"]),
        ...syncState("watch", ["showTL", "showLiveChat", "theaterMode"]),
        ...syncState("settings", ["watchViewReversed"]),
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
        isMobile() {
            return this.$store.state.isMobile;
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
        showHighlightsBar() {
            return (this.comments.length || this.video.songcount) && (!this.isMobile || !this.showTL);
        },
        showUpload() {
            return this.$store.state.uploadPanel;
        },
        getLang() {
            return getYTLangFromState(this.$store.state);
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
            this.$store.commit("watch/resetState");
            this.$store.commit("watch/setId", this.videoId);
            this.$store.dispatch("watch/fetchVideo").then(() => {
                this.$store.dispatch("history/addWatchedVideo", this.video);
                // this.theaterMode = ["live", "upcoming"].includes(this.video.status);
            });
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
            if (!update?.status || !update?.start_actual) return;
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
        toggleTheaterMode() {
            this.theaterMode = !this.theaterMode;
            this.$nextTick(() => {
                this.$refs.watchLayout.scrollTop = 0;
            });
        },
        like() {
            this.$refs?.ytPlayer?.sendLikeEvent();
        },
    },
};
</script>

<style lang="scss">
$nav-bar-height: 56px;
$controls-height: 36px;
$highlights-height: 30px;
$title-info-height: 64px;

.video {
    position: relative;
    padding-bottom: 56.25%;
    padding-bottom: min(56.25%, calc(100vh - #{$nav-bar-height} - #{$controls-height} - #{$title-info-height}));
    width: 100%;
}

/* Video with highlights bar */
.show-highlights-bar .video {
    padding-bottom: min(56.25%, calc(100vh - #{$nav-bar-height} - #{$controls-height} - #{$title-info-height} - #{$highlights-height}));
}

.mobile .video {
  padding-bottom: min(56.25%, calc(100vh - 36px));
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
    height: calc(100vh - #{$nav-bar-height});
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

  &.full-height:not(.mobile) {
    margin-top: -#{$nav-bar-height};
    position: absolute;
    z-index: 10;
    height: 100vh;
    width: 100%;
    background: var(--v-background-base);
    .left, .chat {
      height: 100vh;
    }

    .video {
      height: calc(100vh - #{$controls-height});
    }

    /* When highlights bar might be shown */
    &.show-highlights-bar {
      .video {
        height: calc(100vh - #{$controls-height} - #{$highlights-height});
      }
    }
  }

  /* mobile TL overlay */

  // Mobile mode tl should overlay on top
  &.mobile .chat .tl-overlay {
    width: 100%;
    position: absolute;
    z-index: 5;
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
      /* Full height chat on the right */
      height: calc(100vh - #{$nav-bar-height});
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

  @media (orientation: portrait) and (max-width: 959px) {
    // Default portrait mode position/height for desktop
    .chat {
      position: fixed;
      bottom: 0px;
      width: 100%;
      z-index: 10;
      padding-bottom: 0;
      padding-bottom: calc(env(safe-area-inset-bottom) / 1.75);
      /* floating chat height = total height - controls height - top bar height - height of video */
      height: calc(100% - #{$controls-height} - #{$nav-bar-height} - 100vw * 0.5625);
      /* iOS 11.2 and later */
      height: calc((100% - #{$controls-height} - #{$nav-bar-height} - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    }

    // Mobile has no top nav, update height calc
    &.mobile .chat {
      height: calc(100% - #{$controls-height} - 100vw * 0.5625);
      /* iOS 11.2 and later */
      height: calc((100% - #{$controls-height} - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    }

    &.show-chat .left {
      /* Add padding to allow scrolling up in the small viewer window */
      padding-bottom: calc((100vh - #{$controls-height} - 100vw * 0.5625) - env(safe-area-inset-top, 0px));
    }
  }
}
</style>
