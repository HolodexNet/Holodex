<template>
  <v-card class="watch-card rounded-0">
    <v-card-title
      class="pt-2"
      style="font-size: 1.125rem; font-weight: 400"
    >
      <span v-if="!$route.path.includes('edit')">
        {{ video.jp_name ?
          ($store.state.settings.nameProperty === 'english_name' ?
            video.title || video.jp_name
            : (video.jp_name || video.title))
          : video.title }}
      </span>

      <router-link
        v-else
        tag="span"
        style="cursor: pointer"
        :to="`/watch/${video.id}`"
      >
        {{ video.title }}
      </router-link>
    </v-card-title>
    <v-card-subtitle>
      <span :class="'text-' + video.status" :title="absoluteTimeString">
        {{ formattedTime }}
      </span>
      <span v-if="video.status !== 'live' && video.duration">
        • {{ formatDuration(video.duration * 1000) }}
      </span>
      <span
        v-if="video.status === 'live' && liveViewers"
        class="live-viewers"
      >
        • {{ $t("component.videoCard.watching", [liveViewers]) }}
        <span
          v-if="liveViewerChange"
          :class="liveViewerChange > 0 ? 'green--text' : 'red--text'"
        >
          ({{ (liveViewerChange > 0 ? "+ " : "") + liveViewerChange }})
        </span>
      </span>
      <span
        v-if="video.topic_id"
        style="text-transform: capitalize"
      >
        • <router-link
          :to="searchTopicUrl"
          style="text-decoration: none"
        >
          <v-icon small>{{ icons.mdiAnimationPlay }}</v-icon>
          {{ video.topic_id }}
        </router-link>
      </span>
      <span
        v-if="video.type === 'placeholder' && !(video.certainty === 'certain')"
        style="font-size:95%"
      > <br>
        {{ $t("component.videoCard.uncertainPlaceholder") }}
      </span>
      <slot name="rightTitleAction">
        <v-btn
          id="video-edit-btn"
          text
          x-small
          color="primary"
          class="float-right"
          :to="
            $route.path.includes('edit')
              ? `/watch/${video.id}`
              : `/edit/video/${video.id}${
                video.type !== 'stream' ? '/mentions' : '/'
              }`
          "
        >
          {{
            $route.path.includes("edit")
              ? $t("editor.exitMode")
              : $t("editor.enterMode")
          }}
        </v-btn>
      </slot>
      <!-- <v-icon>{{ icons.mdiRefresh }}</v-icon> -->
    </v-card-subtitle>
    <v-divider />
    <div class="d-flex justify-space-between flex-wrap align-center">
      <v-col cols="auto">
        <v-list>
          <v-list-item>
            <v-list-item-avatar size="80">
              <ChannelImg
                :channel="video.channel"
                size="80"
              />
            </v-list-item-avatar>
            <ChannelInfo
              :channel="video.channel"
              class="uploader-data-list"
              :no-subscriber-count="noSubCount"
            />
            <ChannelSocials :channel="video.channel" />
          </v-list-item>
        </v-list>
      </v-col>
      <v-col cols="auto">
        <v-avatar
          v-if="channelChips && channelChips.length > 0"
          rounded
          left
          size="40"
        >
          <v-icon
            size="25"
            color="grey darken-2"
          >
            {{ mdiAt }}
          </v-icon>
        </v-avatar>
        <template v-for="mention in channelChips">
          <ChannelChip
            :key="mention.id"
            :channel="mention"
            :size="60"
          />
        </template>
        <a
          v-if="mentions.length > 3"
          style="white-space: pre"
          class="text-subtitle-2"
          @click="showAllMentions = !showAllMentions"
        >
          [ {{ showAllMentions ? "-" : "+" }} {{ mentions.length - 3 }} ]
        </a>
      </v-col>
    </div>
    <slot>
      <v-card-text
        class="text-body-2"
        @click="handleClick"
      >
        <truncated-text
          :html="processedMessage"
          lines="4"
        />
      </v-card-text>
    </slot>
  </v-card>
</template>

<script lang="ts">
import ChannelChip from "@/components/channel/ChannelChip.vue";
import ChannelInfo from "@/components/channel/ChannelInfo.vue";
import ChannelSocials from "@/components/channel/ChannelSocials.vue";
import ChannelImg from "@/components/channel/ChannelImg.vue";

import {
    formatDuration,
    formatDistance,
    dayjs,
    localizedDayjs,
    titleTimeString,
} from "@/utils/time";
import TruncatedText from "@/components/common/TruncatedText.vue";
import { mdiAt } from "@mdi/js";
import { formatCount } from "@/utils/functions";

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm;

export default {
    name: "WatchInfo",
    components: {
        ChannelChip,
        ChannelInfo,
        ChannelSocials,
        ChannelImg,
        TruncatedText,
    },
    props: {
        video: {
            type: Object,
            required: true,
            default: null,
        },
        noChips: {
            type: Boolean,
            default: false,
        },
        noSubCount: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            timer: null,
            elapsedTime: 0,
            editMode: false,
            showAllMentions: false,
            lastViewerCount: -1,
            mdiAt,
        };
    },
    computed: {
        lang() {
            return this.$store.state.settings.lang;
        },
        absoluteTimeString() {
            return titleTimeString(this.video.available_at, this.lang);
        },
        formattedTime() {
            switch (this.video.status) {
                case "upcoming":
                    return formatDistance(
                        this.video.start_scheduled,
                        this.lang,
                        this.$t.bind(this),
                    );
                case "live":
                    return this.$t("component.watch.streamingFor", [this.elapsedTime]);
                default:
                    return localizedDayjs(this.video.available_at, this.lang).format(
                        "LLL",
                    );
            }
        },
        liveViewers() {
            if (!this.video.live_viewers) return "";
            return formatCount(+this.video.live_viewers, this.lang);
        },
        liveViewerChange() {
            // if lastViewerCount is unset, then there is no change
            if (this.lastViewerCount < 0) return 0;
            return this.video.live_viewers - this.lastViewerCount;
        },
        mentions() {
            return this.video.mentions || [];
        },
        channelChips() {
            return this.mentions.length > 3 && !this.showAllMentions
                ? this.mentions.slice(0, 3)
                : this.mentions;
        },
        processedMessage() {
            const decoder = document.createElement("div");
            decoder.innerHTML = this.video.description; // using browser assembly script to sanitize
            const sanitized = decoder.textContent;
            const vidUrl = (this.$store.state.settings.redirectMode
                ? "https://youtu.be/"
                : "/watch/") + this.video.id;
            return sanitized.replace(
                COMMENT_TIMESTAMP_REGEX,
                (match, hr, min, sec) => {
                    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                    return `<a class="comment-chip" href="${vidUrl}?t=${time}" data-time="${time}"> ${match} </a>`;
                },
            );
        },
        searchTopicUrl() {
            const topic = this.video.topic_id;
            const capitalizedTopic = topic[0].toUpperCase() + topic.slice(1);
            const { org } = this.video.channel;
            let q = `type,value,text\ntopic,"${topic}","${capitalizedTopic}"`;
            if (org) {
                q += `\norg,${org},${org}`;
            }
            return `/search?${new URLSearchParams({ q })}`;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "video.status": function () {
            this.setTimer();
        },
        // eslint-disable-next-line func-names
        "video.live_viewers": function (nw, old) {
            this.lastViewerCount = old;
        },
    },
    mounted() {
        this.setTimer();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        formatDuration,
        setTimer() {
            if (this.timer) clearInterval(this.timer);
            // if(this.video.status === "live" || this.video.status === "upcoming") {
            //     this.timer = setInterval(()=> {
            //         this.formattedTime = this.formatTime();
            //     }, this.video.status === "live" ? 1000 : 1000*60);
            // }
            if (this.video.status === "live") {
                this.timer = setInterval(() => {
                    this.elapsedTime = this.formatDuration(
                        dayjs().diff(dayjs(this.video.start_actual)),
                    );
                }, 1000);
            }
        },
        handleClick(e) {
            if (e.target.matches(".comment-chip")) {
                this.$emit("timeJump", e.target.getAttribute("data-time"));
                e.preventDefault();
            }
        },
    },
};
</script>

<style>
.watch-card {
  border: none !important;
  box-shadow: none !important;
}
.uploader-data-list {
  flex-basis: auto;
  flex-direction: column;
  align-items: stretch;
  margin-right: 12px;
}
#video-edit-btn {
  font-size: 12px;
}
</style>
