<template>
  <div>
    <template v-if="video.songcount">
      <span class="lightup d-flex">
        <a class="d-block text-overline mx-2 my-1" @click="toggleExpansion('songs')">
          {{ hidden.songs ? "＋" : "－" }} {{ video.songcount }} {{ relationI18N("songs") }}
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
        <v-btn
          icon
          small
          tile
          class="mr-2"
          @click="addToMusicPlaylist"
        >
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
            {{ hidden[relation] ? "＋" : "－" }} {{ related[relation].length }} {{ relationI18N(relation) }}
          </a>
          <v-spacer />
          <v-tooltip
            v-if="relation === 'simulcasts'"
            top
          >
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on">
                <v-btn
                  icon
                  tile
                  :disabled="!simulcastMultiviewLink.ok"
                  small
                  class="mr-2"
                  :to="simulcastMultiviewLink.url"
                >
                  <v-icon small>
                    {{ icons.mdiViewDashboard }}
                  </v-icon>
                </v-btn>
              </span>
            </template>
            <span v-if="simulcastMultiviewLink.ok">
              {{ $t('component.relatedVideo.simulcasts.linkToMultiview.tooltip') }}
            </span>
            <span v-if="!simulcastMultiviewLink.ok">
              {{ $t(`component.relatedVideo.simulcasts.linkToMultiview.error.${simulcastMultiviewLink.error.reason}`, simulcastMultiviewLink.error.i18nParameters) }}
            </span>
          </v-tooltip>
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
import VideoCardList from "@/components/video/VideoCardList.vue";
import filterVideos from "@/mixins/filterVideos";
import { mdiTimerOutline } from "@mdi/js";
import { videoTemporalComparator } from "@/utils/functions";
import { musicdexURL } from "@/utils/consts";
import { decodeLayout, encodeLayout } from "@/utils/mv-utils";
import { mapState } from "vuex";

export default {
    name: "WatchSideBar",
    components: {
        VideoCardList,
        SongItem: () => import("@/components/media/SongItem.vue"),
    },
    mixins: [filterVideos],
    props: {
        video: {
            type: Object,
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
        ...mapState("multiview", ["autoLayout"]),
        // totalRelations() {
        //     return Object.values(this.related).map(r => r.length).reduce((a, b) => a+b);
        // }
        related() {
            const clips = this.video.clips
                ?.filter?.((x) => x.status !== "missing" && this.$store.state.settings.clipLangs.includes(x.lang))
                .sort(videoTemporalComparator)
                .reverse() || [];
            return {
                simulcasts: this.video.simulcasts || [],
                clips,
                sources: this.video.sources || [],
                same_source_clips: (this.video.same_source_clips && this.video.same_source_clips.slice(0, 10)) || [],
                refers: this.video.refers || [],
                recommendations: (this.video.recommendations && this.video.recommendations.slice(0, 10)) || [],
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
                    .sort((a, b) => a.start - b.start);
            }
            return [];
        },
        simulcastMultiviewLink() {
            if (!this.related.simulcasts.length) {
                // There's no simulcasts so let's not make a URL
                return {
                    ok: false,
                    error: {
                        reason: "noSimulcasts",
                        i18nParameters: {},
                    },
                };
            }

            const defaultLayoutString = this.autoLayout[this.related.simulcasts.length + 1];
            if (!defaultLayoutString) {
                // We do not have a default layout for the total amount of streams
                // TODO: We could auto-generate a layout in this case
                return {
                    ok: false,
                    error: {
                        reason: "noDefaultLayout",
                        i18nParameters: {
                            videoCount: this.related.simulcasts.length + 1,
                        },
                    },
                };
            }

            const { layout, content } = decodeLayout(defaultLayoutString);
            if (!layout) {
                console.warn("Unable to decode the default layout.");
                // TODO: We could auto-generate a layout in this case as well
                return {
                    ok: false,
                    error: {
                        reason: "layoutBuildFailure",
                        i18nParameters: {},
                    },
                };
            }

            const allSimulcastVideos = [
                {
                    type: "video",
                    id: this.video.id,
                },
                ...this.related.simulcasts.map((simulcast) => ({
                    type: "video",
                    id: simulcast.id,
                })),
            ];

            // Fill in blank spaces in the layout with the simulcast videos in order.
            // This is for the case where the default layout already has chat boxes specified in content.
            const filledContents = layout.map((_, i) => content[i] ?? allSimulcastVideos.shift());

            if (allSimulcastVideos.length) {
                console.warn(`Expected all videos to be placeable in default, but ${allSimulcastVideos.length} were not able to be placed.`);
                return {
                    ok: false,
                    error: {
                        reason: "layoutBuildFailure",
                        i18nParameters: {},
                    },
                };
            }

            const layoutURIComponent = encodeLayout({
                layout,
                contents: filledContents,
                includeVideo: true,
            });

            if (!layoutURIComponent || layoutURIComponent === "error") {
                console.warn("Unable to encode a layout with the filled contents.");
                return {
                    ok: false,
                    error: {
                        reason: "layoutBuildFailure",
                        i18nParameters: {},
                    },
                };
            }

            return {
                ok: true,
                url: `/multiview/${encodeURIComponent(layoutURIComponent)}`,
            };
        },
    },
    // mounted() {
    //     this.$nextTick(this.updateSongs);
    // },
    created() {
        this.hidden.recommendations = (this.related.refers.length + this.related.clips.length + this.related.sources.length + this.related.same_source_clips.length) >= 5;
    },
    methods: {
        relationI18N(relation) {
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
            const reversed = [...videos].filter((v) => this.filterVideos(v, { hideIgnoredTopics: false }));
            reversed.reverse();
            this.$store.commit("playlist/addVideos", reversed);
        },
        logRelationClick(relation) {
            this.$gtag.event("sidebar-click", {
                event_category: "video",
                event_label: relation,
            });
        },
    },
};
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
