<template>
  <div>
    <template v-if="video.songcount">
      <span class="lightup d-flex">
        <a
          class="d-block text-overline mx-2 my-1"
          @click="toggleExpansion('songs')"
        >
          {{ hidden.songs ? "＋" : "－" }} {{ video.songcount }}
          {{ relationI18N("songs") }}
        </a>
        <v-spacer />
        <v-btn
          icon
          small
          tile
          class="mr-2"
          @click="showDetailed = !showDetailed"
        >
          <v-icon small> {{ mdiTimerOutline }} </v-icon>
        </v-btn>
        <v-btn icon small tile class="mr-2" @click="addToMusicPlaylist">
          <v-icon small> {{ icons.mdiMusic }} </v-icon>
        </v-btn>
      </span>
      <!-- Match the same structure as VideoCardList -->
      <v-expand-transition>
        <v-container v-show="!hidden.songs" class="py-0">
          <v-row>
            <v-list dense style="width: 100%">
              <song-item
                v-for="(song, idx) in songList"
                :key="song.name + song.video_id + idx"
                :detailed="showDetailed"
                :song="song"
                :hover-icon="icons.mdiPlay"
                style="width: 100%"
                @play="$emit('timeJump', song.start)"
                @playNow="$emit('timeJump', song.start)"
              />
            </v-list>
          </v-row>
        </v-container>
      </v-expand-transition>
    </template>
    <template v-for="relation in Object.keys(related)">
      <template v-if="related[relation].length">
        <div :key="`band${relation}`" class="lightup d-flex">
          <a
            :key="`${relation}-title`"
            class="d-block text-overline mx-2 my-1"
            @click="toggleExpansion(relation)"
          >
            {{ hidden[relation] ? "＋" : "－" }} {{ related[relation].length }}
            {{ relationI18N(relation) }}
          </a>
          <v-spacer />
          <v-btn
            :key="`playlist-btn-${relation}`"
            icon
            tile
            small
            class="mr-2"
            @click="addToPlaylist(related[relation])"
          >
            <v-icon small>
              {{ icons.mdiPlaylistPlus }}
            </v-icon>
          </v-btn>
        </div>
        <v-expand-transition :key="`${relation}-anim`">
          <VideoCardList
            v-show="!hidden[relation]"
            :key="`${relation}-videos`"
            :videos="related[relation]"
            horizontal
            include-channel
            :cols="{
              lg: 12,
              md: 4,
              cols: 12,
              sm: 6,
            }"
            dense
            @videoClicked="logRelationClick(relation)"
          />
        </v-expand-transition>
      </template>
    </template>
    <!-- <template v-if="totalRelations === 0">
            No clips or related videos yet...
        </template> -->
  </div>
</template>

<script lang="ts">
// import VideoCardList from "@/components/video/VideoCardList.vue";
// import filterVideos from "@/mixins/filterVideos";
import { mdiTimerOutline } from "@mdi/js";
import { videoTemporalComparator } from "@/utils/functions";
import { musicdexURL } from "@/utils/consts";
import { PropType } from "vue";

export default defineComponent({
  name: "WatchSideBar",
  components: {
    // VideoCardList,
    // SongItem: () => import("@/components/media/SongItem.vue"),
  },
  // mixins: [filterVideos],
  props: {
    video: {
      type: Object as PropType<ExtendedVideo>,
      required: true,
    },
  },
  data() {
    return {
      showDetailed: false,
      mdiTimerOutline,
      hidden: {
        clips: false,
        simulcasts: false,
        refers: false,
        sources: false,
        recommendations: false,
        songs: false,
        same_source_clips: false,
      },
    };
  },
  computed: {
    // totalRelations() {
    //     return Object.values(this.related).map(r => r.length).reduce((a, b) => a+b);
    // }
    related() {
      const clips =
        (this.video.clips &&
          this.video.clips.filter((x) =>
            this.$store.state.settings.clipLangs.includes(x.lang)
          )) ||
        [];
      clips.sort(videoTemporalComparator).reverse();
      return {
        simulcasts: this.video.simulcasts || [],
        clips,
        sources: this.video.sources || [],
        same_source_clips:
          (this.video.same_source_clips &&
            this.video.same_source_clips.slice(0, 10)) ||
          [],
        refers: this.video.refers || [],
      };
    },
    songList() {
      if (this.video && this.video.songs) {
        return this.video.songs
          .map((song) => ({
            ...song,
            video_id: this.video.id,
            channel_id: this.video.channel.id,
            channel: this.video.channel,
          }))
          .sort((a, b) => (a.start || 0) - (b.start || 0));
      }
      return [];
    },
  },
  // mounted() {
  //     this.$nextTick(this.updateSongs);
  // },
  created() {
    this.hidden.recommendations =
      this.related.refers.length +
        this.related.clips.length +
        this.related.sources.length +
        this.related.same_source_clips.length >=
      5;
  },
  methods: {
    relationI18N(relation: string) {
      switch (relation) {
        case "clips":
          return this.$t("component.relatedVideo.clipsLabel");
        case "simulcasts":
          return this.$t("component.relatedVideo.simulcastsLabel");
        case "refers":
          return this.$t("component.relatedVideo.refersLabel");
        case "sources":
          return this.$t("component.relatedVideo.sourcesLabel");
        case "recommendations":
          return this.$t("component.relatedVideo.recommendationsLabel");
        case "songs":
          return this.$t("component.relatedVideo.songsLabel");
        case "same_source_clips":
          return this.$t("component.relatedVideo.sameSourceClips");
        default:
          return "";
      }
    },
    toggleExpansion(relation) {
      this.hidden[relation] = !this.hidden[relation];
    },
    addToMusicPlaylist() {
      window.open(`${musicdexURL}/video/${this.video.id}`, "_blank");
    },
    addToPlaylist(videos) {
      const reversed = [...videos].filter((v) =>
        this.filterVideos(v, { hideIgnoredTopics: false })
      );
      reversed.reverse();
      this.$store.commit("playlist/addVideos", reversed);
    },
    // logRelationClick(relation) {
    //   this.$gtag.event("sidebar-click", {
    //     event_category: "video",
    //     event_label: relation,
    //   });
    // },
  },
});
</script>

<style>
.lightup {
  z-index: 1;
  position: relative;
  display: block;
}
.lightup * {
  z-index: 1;
  line-height: 28px !important;
}
.lightup::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.lightup:hover::after {
  background-color: var(--v-secondary-base);
  opacity: 0.1;
  z-index: -1;
}
</style>
