<template>
    <div>
        <template v-if="video.songcount">
            <span class="lightup">
                <v-btn icon small tile @click="showDetailed = !showDetailed" class="float-right mr-2">
                    <v-icon small> {{ mdiTimerOutline }} </v-icon></v-btn
                >
                <v-btn icon small tile @click="addToMusicPlaylist" class="float-right mr-2">
                    <v-icon small> {{ icons.mdiPlaylistPlus }} </v-icon></v-btn
                >
                <a class="d-block text-overline mx-2 my-1" @click="toggleExpansion('songs')">
                    {{ hidden.songs ? "＋" : "－" }} {{ relationI18N("songs") }}
                </a>
            </span>
            <!-- Match the same structure as VideoCardList -->
            <v-expand-transition>
                <v-container class="py-0" v-show="!hidden.songs">
                    <v-row>
                        <v-list dense>
                            <song-item
                                :detailed="showDetailed"
                                v-for="(song, idx) in songList"
                                :song="song"
                                :key="song.name + song.video_id + idx"
                                @play="$emit('timeJump', song.start)"
                                @playNow="$store.commit('music/skipTo', idx)"
                                :hoverIcon="icons.mdiPlay"
                                style="width: 100%"
                            ></song-item>
                        </v-list>
                    </v-row>
                </v-container>
            </v-expand-transition>
        </template>
        <template v-for="relation in Object.keys(related)">
            <template v-if="related[relation].length">
                <div class="lightup" :key="`band${relation}`">
                    <v-btn
                        icon
                        tile
                        small
                        @click="addToPlaylist(related[relation])"
                        class="float-right mr-2"
                        :key="`playlist-btn-${relation}`"
                        ><v-icon small> {{ icons.mdiPlaylistPlus }} </v-icon></v-btn
                    >
                    <a
                        class="d-block text-overline mx-2 my-1"
                        :key="`${relation}-title`"
                        @click="toggleExpansion(relation)"
                    >
                        {{ hidden[relation] ? "＋" : "－" }} {{ relationI18N(relation) }}
                    </a>
                </div>
                <v-expand-transition :key="`${relation}-anim`">
                    <VideoCardList
                        @videoClicked="logRelationClick(relation)"
                        v-show="!hidden[relation]"
                        :key="`${relation}-videos`"
                        :videos="related[relation]"
                        horizontal
                        includeChannel
                        :cols="{
                            lg: 12,
                            md: 4,
                            cols: 12,
                            sm: 6,
                        }"
                        dense
                    >
                    </VideoCardList>
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
import { mdiTimerOutline } from "@mdi/js";

export default {
    name: "WatchSideBar",
    components: {
        VideoCardList,
        SongItem: () => import("@/components/media/SongItem.vue"),
    },
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
            },
        };
    },
    computed: {
        // totalRelations() {
        //     return Object.values(this.related).map(r => r.length).reduce((a, b) => a+b);
        // }
        related() {
            return {
                simulcasts: this.video.simulcasts || [],
                clips:
                    (this.video.clips &&
                        this.video.clips.filter((x) => this.$store.state.settings.clipLangs.includes(x.lang))) ||
                    [],
                sources: this.video.sources || [],
                refers: this.video.refers || [],
                recommendations: (this.video.recommendations && this.video.recommendations.slice(0, 10)) || [],
            };
        },
        songList() {
            if (this.video && this.video.songs) {
                return this.video.songs
                    .map((song) => {
                        return {
                            ...song,
                            video_id: this.video.id,
                            channel_id: this.video.channel.id,
                            channel: this.video.channel,
                        };
                    })
                    .sort((a, b) => a.start - b.start);
            }
            return [];
        },
    },
    mounted() {
        this.$nextTick(this.updateSongs);
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
                default:
                    return "";
            }
        },
        toggleExpansion(relation) {
            this.hidden[relation] = !this.hidden[relation];
        },
        addToMusicPlaylist() {
            this.$store.commit("music/addSong", this.songList);
        },
        addToPlaylist(videos) {
            const reversed = [...videos];
            reversed.reverse();
            this.$store.commit("playlist/addVideos", reversed);
        },
        logRelationClick(relation) {
            console.log("log relation click");
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
    z-index: 3;
    position: relative;
    display: block;
}
.lightup * {
    z-index: 2;
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
