<template>
  <a
    class="flex video-card no-decoration" :class="{
      'video-card-fluid': fluid,
      'video-card-active': active,
      'video-card-horizontal': horizontal,
      'video-card-list': denseList,
      'flex-col': !horizontal && !denseList,
    }" :target="redirectMode ? '_blank' : ''" :href="href" rel="noopener" draggable="true" style="position: relative"
    @click.exact="onThumbnailClicked" @dragstart="drag"
  >
    <!-- Video Image with Duration -->
    <div
      v-if="!denseList" style="position: relative; width: 100%"
      class="flex flex-shrink-0 rounded video-thumbnail white--text" :style="
        horizontal &&
          !shouldHideThumbnail &&
          `background: url(${imageSrc}) center/cover;`
      "
    >
      <!-- Image Overlay -->
      <!-- d-flex justify-space-between flex-column (old) -->
      <div
        class="flex flex-col justify-between video-card-overlay " 
        style="height: 100%; position: absolute; width: 100%; z-index: 1"
      >
        <div class="flex justify-between align-start">
          <!-- Topic Id display -->
          <div
            class="rounded-tl-sm video-topic"
            :style="{ visibility: data.topic_id ? 'visible' : 'hidden' }"
          >
            {{ data.topic_id }}
          </div>

          <!-- Check box for saved video (👻❌) -->
          <v-icon
            v-if="!isPlaceholder" :color="hasSaved ? 'primary' : 'white'"
            class="rounded-tr-sm video-card-action" :class="{ 'hover-show': !hasSaved && !isMobile }"
            role="img"
            @click.prevent.stop="toggleSaved($event)"
          >{{ hasSaved ? icons.mdiCheck : icons.mdiPlusBox }}</v-icon>
        </div>

        <!-- Video duration/music indicator (👻❌) -->
        <div v-if="!isPlaceholder" class="flex flex-col align-bottom">
          <!-- Show music icon if songs exist -->
          <div v-if="data.songcount" class="video-duration">
            <v-icon small color="white">mdi-music</v-icon>
          </div>
          <!-- Show TL chat icon if recently active or has archive tl exist -->
          <div v-if="hasTLs" class="flex video-duration align-center" :title="tlIconTitle">
            {{ tlLangInChat }}
            <v-icon small color="white">chat</v-icon>
          </div>
          <!-- Duration/Current live stream time -->
          <div
            v-if="(data.duration || 0) > 0 || data.start_actual" class="rounded-br-sm video-duration"
            :class="data.status === 'live' && 'video-duration-live'"
          >
            {{ formattedDuration }}
          </div>
        </div>
        <div v-else-if="data.placeholderType" class="flex content-end flex-column ">
          <!-- (👻✅) -->
          <div class="video-duration">
            <span v-if="data.placeholderType === 'scheduled-yt-stream'" class="hover-placeholder">{{
              $t('component.videoCard.typeScheduledYT')
            }}</span>
            <span v-else-if="data.placeholderType === 'external-stream'" class="hover-placeholder">{{
              $t('component.videoCard.typeExternalStream')
            }}</span>
            <span v-else-if="data.placeholderType === 'event'" class="hover-placeholder">{{
              $t('component.videoCard.typeEventPlaceholder')
            }}</span>
            <v-icon color="white" class="rounded-sm">

              {{ twitchPlaceholder ? mdiTwitch : placeholderIconMap[data.placeholderType] }}
            </v-icon>
          </div>

        </div>
      </div>
      <v-img
        v-if="!horizontal && !shouldHideThumbnail" :src="imageSrc" :aspect-ratio="16 / 9" width="100%" cover
        :transition="false" class="rounded"
        :class="{ 'hover-opacity': data.placeholderType === 'scheduled-yt-stream' }"
      />
      <v-img v-else-if="!horizontal && shouldHideThumbnail" width="100%" :aspect-ratio="60 / 9" />
    </div>
    <a
      class="flex flex-row flex-grow-1 no-decoration video-card-text" :href="watchLink" rel="noopener"
      @click.exact.stop.prevent="goToVideo()"
    >
      <!-- Channel icon -->
      <div
        v-if="denseList || (includeChannel && includeAvatar && !horizontal && data.channel)"
        class="flex flex-col mx-2 align-self-center"
      >
        <channel-img :channel="data.channel" rounded class="align-self-center" />
      </div>
      <!-- Three lines for title, channel, available time -->
      <div class="flex flex-col video-card-lines">
        <!-- Video title -->
        <div
          :class="['video-card-title ', { 'video-watched': hasWatched }, { 'mt-2': !horizontal && !denseList }]"
          :title="title" style="user-select: text" :style="{
            'font-size': `${1 - site.settings.gridDensity / 16}rem`,
          }"
        >
          {{ title }}
        </div>
        <!-- Channel -->
        <div v-if="includeChannel" class="channel-name video-card-subtitle">
          <a
            class="no-decoration" :class="{
              'name-vtuber':
                data.type === 'stream' || data.channel.type === 'vtuber',
            }" :href="`/channel/${data.channel.id}`" :title="data.channel.name +
              (data.channel.english_name ? `\nEN: ${data.channel.english_name}` : '') +
              (data.channel.org ? `\n> ${data.channel.org}` : '') +
              (data.channel.group ? `\n> ${data.channel.group}` : '')" @click.exact.stop.prevent="goToChannel"
          >
            {{ channelName }}
          </a>
        </div>
        <!-- Time/Viewer Info -->
        <div class="video-card-subtitle">
          <span :class="'text-' + data.status" :title="absoluteTimeString">
            {{ formattedTime }}
          </span>
          <!-- (👻❌) -->
          <template v-if="data.clips && data.clips.length > 0 && !isPlaceholder">
            •
            <span class="primary--text">
              {{
                $tc(
                  "component.videoCard.clips",
                  typeof data.clips === "object"
                    ? data.clips.length
                    : +data.clips
                )
              }}
            </span>
          </template>
          <template v-else-if="data.status === 'live' && data.live_viewers">
            •
            {{
              $tc(
                "component.videoCard.watching",
                formatCount(data.live_viewers, lang),
                [formatCount(data.live_viewers, lang)]
              )
            }}
          </template>
        </div>
      </div>
      <!-- Vertical dots menu -->
      <v-menu v-model="showMenu" bottom :close-on-content-click="false" nudge-top="20px">
        <template #activator="{ props }">
          <v-btn
            icon v-bind="props" :ripple="false" class="video-card-menu"
            :class="{ 'hover-show': !hasSaved && !isMobile }" @click.stop.prevent="() => { }"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <video-card-menu :video="data" @closeMenu="showMenu = false" />
      </v-menu>
    </a>
    <!-- optional breaker object to row-break into a new row. -->
    <!-- <v-list-item-action v-if="!!$slots.action || activePlaylistItem" class="video-card-item-actions">
      <template v-if="activePlaylistItem">
        <button @click.stop.prevent="move(data.id, 'up')">
          <v-icon small> {{ icons.mdiChevronUp }} </v-icon>
        </button>
        <button
          @click.stop.prevent="playlistStore.removeVideoByID(data.id) "
        >
          <v-icon small> {{ icons.mdiDelete }} </v-icon>
        </button>
        <button @click.stop.prevent="move(data.id, 'down')">
          <v-icon small> {{ icons.mdiChevronDown }} </v-icon>
        </button>
      </template>
      <slot name="action" />
    </v-list-item-action>-->
    <!-- 👻👻👻 Placeholder MODAL 👻👻👻 -->
    <!-- <placeholder-card v-if="placeholderOpen" v-model="placeholderOpen" :video="data" /> -->
  </a>
</template>

<script lang="ts">
import { useLangStore } from "@/stores/lang";
import { usePlaylistStore } from "@/stores/playlist";
import { useSiteStore } from "@/stores/site";
import { useWatchHistoryStore } from "@/stores/watchHistory";
import {
    formatCount,
    getVideoThumbnails,
    decodeHTMLEntities,
} from "@/utils/functions";
import {
    formatDuration,
    formatDistance,
    dayjs,
    localizedDayjs,
} from "@/utils/time";
import { mdiBroadcast, mdiTwitch } from "@mdi/js";
import { computedAsync, useNow } from "@vueuse/core";
import { PropType } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
/* eslint-disable no-unused-vars */

export default defineComponent({
    name: "VideoCard",
    components: {
        // ChannelImg: () => import("@/components/channel/ChannelImg.vue"),
        // PlaceholderCard: () => import("./PlaceholderCard.vue"),
        // VideoCardMenu,
    },
    props: {
        video: {
            // required: true,
            type: Object as PropType<Video>,
            default: null,
        },
        source: {
            type: Object as PropType<Video>,
            default: null,
        },
        fluid: {
            required: false,
            type: Boolean,
            default: false,
        },
        includeChannel: {
            required: false,
            type: Boolean,
            default: false,
        },
        includeAvatar: {
            required: false,
            type: Boolean,
            default: false,
        },
        hideThumbnail: {
            required: false,
            type: Boolean,
            default: false,
        },
        horizontal: {
            required: false,
            type: Boolean,
            default: false,
        },
        colSize: {
            required: false,
            type: Number,
            default: 1,
        },
        active: {
            required: false,
            type: Boolean,
            default: false,
        },
        disableDefaultClick: {
            required: false,
            type: Boolean,
            default: false,
        },
        activePlaylistItem: {
            type: Boolean,
            default: false,
        },
        parentPlaylistId: {
            type: [Number, String],
            default: null,
        },
        denseList: {
            type: Boolean,
            required: false,
        },
    },
    emits: { 'videoClicked': null }, setup(props) {
        const site = useSiteStore();
        const display = useDisplay();

        const isMobile = display.mobile

        const langStore = useLangStore()

        const playlistStore = usePlaylistStore();
        const hasSaved = computed(() => (playlistStore.contains(props.video.id)))

        const history = useWatchHistoryStore();
        const hasWatched = computedAsync(() => history.hasWatched((props.source || props.video).id), null);

        const now = useNow({ interval: 1000 })

        return { site, display, isMobile, langStore, hasSaved, playlistStore, hasWatched, now }
    },
    data() {
        return {
            forceJPG: true,
            mdiTwitch,
            placeholderIconMap: {
                event: 'mdi-calendar',
                "scheduled-yt-stream": 'mdi-youtube',
                "external-stream": 'mdi-broadcast',
            },
            placeholderOpen: false,
            showMenu: false,
        };
    },
    computed: {
        data() {
            return this.source || this.video;
        },
        isPlaceholder() {
            return this.data.type === "placeholder";
        },
        title() {
            if (this.isPlaceholder) {
                return decodeHTMLEntities(this.langStore.preferredLocaleFn(this.data.title ?? this.data.jp_name, this.data.jp_name ?? this.data.title) || '')
            }
            if (!this.data.title) return "";
            return decodeHTMLEntities(this.data.title);
        },
        lang() {
            return this.langStore.lang;
        },
        formattedTime() {
            switch (this.data.status) {
                case "upcoming":
                    // print relative time in hours if less than 24 hours,
                    // print full date if greater than 24 hours
                    return formatDistance(
                        this.data.start_scheduled || this.data.available_at,
                        this.lang,
                        this.$t.bind(this),
                        false, // allowNegative = false
                        dayjs(this.now),
                    ); // upcoming videos don't get to be ("5 minutes ago")
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return formatDistance(
                        this.data.available_at,
                        this.lang,
                        this.$t.bind(this),
                    );
            }
        },
        absoluteTimeString() {
            const ts = localizedDayjs(this.data.available_at, this.lang);

            const ts1 = ts.format(`${ts.isTomorrow() ? "ddd " : ""}LT zzz`);
            const ts2 = ts
                .tz("Asia/Tokyo")
                .format(`${ts.isTomorrow() ? "ddd " : ""}LT zzz`);
            if (ts1 === ts2) {
                return ts1;
            }
            return `${ts1}\n${ts2}`;
        },
        videoTitle() {
            return this.title;
        },
        formattedDuration() {
            if (this.data.start_actual && this.data.status === "live") {
                return this.formatDuration(
                    dayjs(this.now).diff(dayjs(this.data.start_actual)),
                );
            }
            if (this.data.status === "upcoming" && this.data.duration) {
                return this.$t("component.videoCard.premiere");
            }
            return (
                this.data.duration && this.formatDuration(this.data.duration * 1000)
            );
        },
        imageSrc() {
            // load different images based on current column size, which correspond to breakpoints
            if (this.data.thumbnail) {
                const enc = btoa(this.data.thumbnail);
                const n = enc.replace("+", "-").replace("/", "_").replace(/=+$/, "");
                return `/statics/thumbnail/default/${n}.jpg`;
            }
            if (this.data.type === "placeholder") {
                return `/statics/channelImg/${this.data.channel.id}.png`;
            }
            const srcs = getVideoThumbnails(this.data.id, false);
            if (this.horizontal) return srcs.medium;
            if (this.colSize > 2 && this.colSize <= 8) {
                return window.devicePixelRatio > 1 ? srcs.standard : srcs.medium;
            }
            return srcs.standard;
        },
        redirectMode() {
            return this.site.settings.redirectMode;
        },
        shouldHideThumbnail() {
            return this.site.settings.hideThumbnail || this.hideThumbnail;
        },
        channelName() {
            return this.langStore.preferredLocaleFn(this.data.channel.english_name, this.data.channel.name);
        },
        watchLink() {
            const q = this.parentPlaylistId
                ? `?playlist=${this.parentPlaylistId}`
                : "";
            return `/watch/${this.data.id}${q}`;
        },
        hasTLs() {
            return false;
            // TODO: Live TL

            // const lang = this.site.settings.liveTlLang;
            // return (
            //     (this.data?.status === "past" && this.data?.live_tl_count?.[lang])
            //     || this.data?.recent_live_tls?.includes(lang)
            // );
        },
        tlLangInChat() {
            return "";
            // TODO: Live TL

            // const lang = this.site.settings.liveTlLang;
            // return this.hasTLs && this.data.status === "past"
            //     ? `${this.data.live_tl_count[lang]}`
            //     : "";
        },
        tlIconTitle() {
            return this.data.status === "past"
                ? this.$t("component.videoCard.totalTLs")
                : this.$t("component.videoCard.tlPresence");
        },
        href() {
            if (this.isPlaceholder) return undefined;
            return this.redirectMode ? `https://youtu.be/${this.data.id}` : this.watchLink;
        },
        twitchPlaceholder() {
            return this.data.link?.includes("twitch.tv");
        },
    },
    // created() {
    //     this.data = this.video || this.source;
    // },
    methods: {
        formatDuration,
        formatCount,
        formatDistance,
        // Adds video to saved videos library
        toggleSaved(event: { preventDefault: () => void; }) {
            event.preventDefault();
            if (this.data.type === VIDEO_TYPES.PLACEHOLDER) return; // huh.
            this.hasSaved
                ? this.playlistStore.removeVideoByID(this.data.id)
                : this.playlistStore.addVideo(this.data);
        },
        goToVideo() {
            this.$emit("videoClicked", this.data);
            if (this.isPlaceholder) {
                this.openPlaceholder(); return;
            }
            if (this.disableDefaultClick) return;
            // On mobile, clicking on watch links should not increment browser history
            // Back button will always return to the originating video list in one click
            if (this.$route.path.match("^/watch") && this.isMobile) {
                this.$router.replace({ path: this.watchLink });
            } else {
                this.$router.push({ path: this.watchLink });
            }
        },
        onThumbnailClicked(e: { preventDefault: () => void; }) {
            if (this.isPlaceholder && this.data.placeholderType === "external-stream" && this.data.link) {
                e.preventDefault();
                window.open(this.data.link, "_blank", "noopener");
                return;
            }
            if (this.isPlaceholder || !this.redirectMode || this.disableDefaultClick) {
                e.preventDefault();
                this.goToVideo();
            }
        },
        openPlaceholder() {
            this.placeholderOpen = true;
        },
        goToChannel() {
            this.$emit("videoClicked", this.data);
            if (this.disableDefaultClick) return;
            this.$router.push({ path: `/channel/${this.data.channel.id}` });
        },
        goToYoutube() {
            this.$emit("videoClicked", this.data);
            if (this.disableDefaultClick) return;
            const url = `https://www.youtube.com/watch?v=${this.data.id}`;
            window.open(url, "_blank", "noopener");
        },
        drag(ev: DragEvent) {
            if (!ev.dataTransfer)
                return; //clearly it's not supported
            ev.dataTransfer.setData(
                "text",
                `https://holodex.net/watch/${this.data.id}`,
            );
            ev.dataTransfer.setData("application/json", JSON.stringify(this.data));
        },
        move(id: any, direction: any) {
            const playlist = this.playlistStore.active;
            const curIdx = playlist.videos.findIndex((elem: { id: any; }) => elem.id === id);
            if (curIdx < 0) throw new Error("huh");
            let toIdx = 0;
            switch (direction) {
                case "up":
                    toIdx = curIdx - 1;
                    break;
                case "down":
                    toIdx = curIdx + 1;
                    break;
                default:
                    break;
            }
            if (toIdx < 0) throw new Error("can't move stuff before 0");
            if (toIdx >= playlist.videos.length) { throw new Error("can't move stuff to beyond the end"); }
            this.playlistStore.reorder({ from: curIdx, to: toIdx })
        },
    },
});
</script>

<style scoped lang="scss">
.theme--light .video-watched {
    color: var(--v-secondary-darken2) !important;
}

.theme--dark .video-watched {
    color: var(--v-secondary-lighten2) !important;
    opacity: 0.6;
}

.video-card-fluid {
    width: 100%;
}

.text-live {
    color: red;
    font-weight: 500;
}

.video-card-text {
    min-height: 88px;
    position: relative;
}

/* https://css-tricks.com/almanac/properties/w/word-break/ */
.video-card-lines div {
    line-height: 1.2;
    /* padding-bottom: 0.2rem; */
    margin-bottom: 2px;
    flex-grow: 1;
    justify-content: space-around;
}

.video-card-title {
    line-height: 1.25rem !important;
    max-height: 2.5rem;

    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    word-break: break-word;

    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    hyphens: auto;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    padding-right: 22px;
}

.channel-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    white-space: initial;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    display: -webkit-box;
}

.channel-name>a:hover {
    color: black !important;
}

.theme--dark .channel-name>a:hover {
    color: white !important;
}

.video-card .hover-show {
    visibility: hidden;
}

.video-card:hover .hover-show {
    visibility: visible;
}

.video-card .hover-placeholder {
    visibility: hidden;
    display: none;
    line-height: 13px;
    position: relative;
    top: 1px;
}

.video-card:hover .hover-placeholder {
    visibility: visible;
    display: inline-block;
    line-height: 13px;
    position: relative;
    top: 1px;
}

.video-card .hover-opacity {
    opacity: 0.6;
}

.video-card:hover .hover-opacity {
    opacity: 1.0;
}

.video-duration {
    background-color: rgba(0, 0, 0, 0.8);
    margin: 2px;
    padding: 2px 5px;
    text-align: center;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
    line-height: 0.81rem;

    &.video-duration-live {
        background-color: rgba(148, 0, 0, 0.8);
    }
}

.video-topic {
    background-color: rgba(0, 0, 0, 0.8);
    margin: 2px;
    padding: 1px 5px;
    text-align: center;
    font-size: 0.8125rem;
    letter-spacing: 0.025em;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.video-card-action {
    background-color: rgba(0, 0, 0, 0.8);
    padding: 2px;
    margin: 2px;
}

.video-card-horizontal {
    flex-direction: row !important;

    .video-thumbnail {
        margin-right: 5px;
        width: 150px !important;
    }

    .video-card-text {
        .video-card-lines {
            justify-content: space-around;
        }
    }
}

.video-card-list {
    flex-direction: row !important;
    min-height: 40px;

    .video-card-text {
        min-height: auto;
        align-items: center;

        .video-card-lines {
            margin-right: 40px;
            flex-direction: row !important;
            flex-wrap: wrap;
            width: 100%;
            justify-content: flex-start;
            align-items: center;

            .video-card-title {
                flex-basis: 50%;
            }

            .channel-name.video-card-subtitle {
                flex-basis: 200px;
            }

            .video-card-subtitle:last-of-type {
                flex-basis: 150px;
            }
        }
    }
}

.name-vtuber {
    color: #42a5f5 !important;
}

.video-card-active {
    /* primary color with opacity */
    /* background-color: #f0629257; */
    height: auto;
    width: auto;
    position: relative;
}

.video-card-active::before {
    content: "";
    background-color: var(--v-primary-darken2);
    background-size: cover;
    position: absolute;
    top: -1px;
    right: -1px;
    bottom: -1px;
    left: -1px;
    opacity: 0.15;
    border-radius: 4px;
}

.video-card-subtitle {
    line-height: 1.2;
    font-size: 0.875rem;
    color: hsla(0, 0%, 100%, 0.7);
}

.theme--light .video-card-subtitle {
    color: rgba(0, 0, 0, 0.6);
}

.video-card-menu {
    position: absolute;
    right: 0px;
    display: inline-block;
    top: 5px;
    z-index: 1;
}
</style>
