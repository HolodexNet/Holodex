<template>
    <div>
        <v-row align="center">
            <v-divider> </v-divider> <span class="text-overline"> {{ $t("editor.music.titles.addSong") }} </span>
            <v-divider> </v-divider>
            <v-dialog content-class="width-auto">
                <template v-slot:activator="{ on }">
                    <div v-on="on" @click="mountTwitter">
                        <span class="text-overline"> {{ $t("editor.music.titles.help") }} </span>
                        <v-btn fab color="info" class="mx-1" x-small
                            ><v-icon>{{ icons.mdiHelpCircle }}</v-icon></v-btn
                        >
                    </div>
                </template>
                <v-card>
                    <blockquote class="twitter-tweet">
                        <p lang="en" dir="ltr">
                            Easily create Music entries on Holodex, coming soon! 🎵🎶
                            <a href="https://t.co/1KJXYDcJjo">pic.twitter.com/1KJXYDcJjo</a>
                        </p>
                        &mdash; Holodex (@holodex)
                        <a href="https://twitter.com/holodex/status/1371290072058785797?ref_src=twsrc%5Etfw"
                            >March 15, 2021</a
                        >
                    </blockquote>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row dense>
            <v-col cols="8" sm="9" md="10" lg="10">
                <song-search :value="current.song" :id="current.itunesid" @input="processSearch" ref="search" />
            </v-col>
            <v-col cols="4" sm="3" md="2" lg="2">
                <v-text-field
                    outlined
                    readonly
                    disabled
                    label="TrackId"
                    hide-details="auto"
                    :value="current.itunesid || 'N/A'"
                    style="font-size: 12px"
                />
            </v-col>
            <v-col cols="12" sm="7" md="6" lg="6">
                <v-text-field
                    outlined
                    :label="$t('editor.music.trackNameInput')"
                    hide-details="auto"
                    v-model="current.name"
                />
            </v-col>
            <v-col cols="12" sm="5" md="6" lg="6">
                <v-text-field
                    outlined
                    :label="$t('editor.music.originalArtistInput')"
                    hide-details="auto"
                    v-model="current.original_artist"
                />
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="6" class="d-flex align-justify">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button
                            v-on="on"
                            class="tweak-btn"
                            @click="
                                current.start -= 2;
                                current.end -= 2;
                                currentStartTime = secondsToHuman(current.start);
                            "
                        >
                            <v-icon small>{{ icons.mdiChevronLeft }}</v-icon> 2s
                        </button>
                    </template>
                    <span>{{ $t("editor.music.moveLeft2s") }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button v-on="on" class="tweak-btn red" @click="currentStartTime = secondsToHuman(currentTime)">
                            <v-icon>{{ mdiTimerOutline }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.setToCurrentTime", [secondsToHuman(currentTime)]) }}</span>
                </v-tooltip>

                <v-text-field
                    outlined
                    :label="$t('editor.music.startInput')"
                    placeholder="12:31"
                    hide-details="auto"
                    v-model="currentStartTime"
                    :rules="[checkStartTime]"
                    validate-on-blur
                    class="tweak-input"
                >
                </v-text-field>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button v-on="on" class="tweak-btn" @click="$emit('timeJump', current.start, true)">
                            <v-icon>{{ mdiDebugStepOver }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.testStart") }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button
                            v-on="on"
                            class="tweak-btn"
                            @click="
                                current.start += 2;
                                current.end += 2;
                                currentStartTime = secondsToHuman(current.start);
                            "
                        >
                            2s<v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.moveRight2s") }}</span>
                </v-tooltip>
            </v-col>
            <v-col cols="12" sm="6" md="6" lg="6" class="d-flex align-justify">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button v-on="on" class="tweak-btn" @click="current.end -= 2">
                            <v-icon small>{{ icons.mdiChevronLeft }}</v-icon> 2s
                        </button>
                    </template>
                    <span>{{ $t("editor.music.moveLeft2s") }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button v-on="on" class="tweak-btn red" @click="currentEndTime = secondsToHuman(currentTime)">
                            <v-icon>{{ mdiTimerOutline }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.setToCurrentTime", [secondsToHuman(currentTime)]) }}</span>
                </v-tooltip>

                <v-text-field
                    outlined
                    :label="$t('editor.music.endInput', [secondsToHuman(current.end)])"
                    placeholder="312"
                    hide-details="auto"
                    v-model="currentEndTime"
                    :rules="[checkEndTime]"
                    validate-on-blur
                    class="tweak-input"
                >
                </v-text-field>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button
                            v-on="on"
                            class="tweak-btn"
                            @click="$emit('timeJump', Math.max(current.end - 3, 0), true)"
                        >
                            <v-icon>{{ mdiEarHearing }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.testEnd") }}</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <button v-on="on" class="tweak-btn" @click="current.end += 2">
                            2s<v-icon small>{{ icons.mdiChevronRight }}</v-icon>
                        </button>
                    </template>
                    <span>{{ $t("editor.music.moveRight2s") }}</span>
                </v-tooltip>
            </v-col>
            <v-col cols="4" sm="6" md="8">
                <v-btn
                    color="success"
                    elevation="5"
                    width="100%"
                    @click="addSong"
                    :disabled="!canSave || !priviledgeSufficient"
                >
                    {{ addOrUpdate }}
                </v-btn>
            </v-col>
            <v-col cols="2" sm="2" md="1">
                <v-btn color="red" elevation="5" width="100%" style="padding: 0 0px; min-width: 30px" @click="reset">
                    <v-icon>{{ mdiRestore }}</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="3">
                <v-btn
                    :disabled="!current.amUrl"
                    elevation="5"
                    width="100%"
                    class="am-listen-btn"
                    :href="current.amUrl"
                    rel="norefferer"
                    target="_blank"
                >
                    <v-avatar left tile size="26px">
                        <v-img
                            src="https://apple-resources.s3.amazonaws.com/medusa/production/images/5f600674c4f022000191d6c4/en-us-large@1x.png"
                        ></v-img>
                    </v-avatar>
                    <span class="ml-2" style="font-size: 0.7rem">Listen on Apple Music</span>
                </v-btn>
            </v-col>
            <v-col cols="12">
                <v-alert v-if="!canSave && !priviledgeSufficient" color="error" v-html="$t('editor.music.permission')">
                </v-alert>
            </v-col>
        </v-row>
        <v-row align="center">
            <v-divider> </v-divider>
            <span class="text-overline"> {{ $t("editor.music.titles.songList", [video.title]) }}</span>
            <v-divider> </v-divider>
        </v-row>
        <v-row dense>
            <v-col cols="12">
                <v-list style="min-height: 30vh">
                    <template v-for="song in songList">
                        <song-item
                            :song="song"
                            :key="song.name"
                            detailed
                            @remove="removeSong"
                            @play="
                                (x) => {
                                    $emit('timeJump', x.start);
                                    current = JSON.parse(JSON.stringify(x));
                                    currentStartTimeInput = secondsToHuman(current.start);
                                }
                            "
                            @playNow="(x) => $emit('timeJump', x.start, true)"
                            :hoverIcon="icons.mdiPencil"
                            :artworkHoverIcon="icons.mdiPlay"
                        ></song-item>
                    </template>
                </v-list>
            </v-col>
        </v-row>
    </div>
</template>

<script lang="ts">
import { mdiEarHearing, mdiRestore, mdiTimerOutline, mdiDebugStepOver } from "@mdi/js";
import Vue from "vue";

import backendApi from "@/utils/backend-api";
import { secondsToHuman } from "@/utils/time";
import SongSearch from "./SongSearch.vue";
import SongItem from "./SongItem.vue";

function humanToSeconds(str) {
    const p = str.split(":");
    let s = 0;
    let m = 1;
    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }
    return s;
}

function maskTimestamp(s) {
    const p = s.split(":").join("").split("");
    const newStr = [];

    // remove prefix zeroes
    while (p.length > 0 && p[0] === "0") {
        p.shift();
    }

    // Parse numbers in groups of 2
    while (p.length > 0) {
        if (p.length === 1) {
            newStr.unshift(`${p}`);
            break;
        }
        const swap = p.pop();
        newStr.unshift(p.pop() + swap);
    }

    return newStr.join(":");
}

const startTimeRegex = /^\d+([:]\d+)?([:]\d+)?$/;
const endTimeRegex = /^\+\d+$|^\d+(:\d+)?(:\d+)?$/;

function getEmptySong(video) {
    return {
        // current -> the item being edited at the moment.
        song: null, // itunes song object (ephemeral, not always present)
        itunesid: null,
        start: 0,
        end: 0,
        name: "",
        original_artist: "",
        amUrl: null,
        art: null,
        video_id: video.id,
        channel_id: video.channel.id,
        channel: {
            name: video.channel.name,
            english_name: video.channel.english_name,
        },
        available_at: video.available_at,
    };
}

// TODO(jprochazk): `Vue.extend` for type inference instead of the lazy way of `const self = this as any`
export default {
    components: {
        SongSearch,
        SongItem,
    },
    data() {
        return {
            mdiEarHearing,
            mdiRestore,
            mdiTimerOutline,
            mdiDebugStepOver,
            current: getEmptySong(this.video),
            songList: [],

            currentStartTimeInput: "",
        };
    },
    props: {
        video: {
            type: Object,
            required: true,
        },
        currentTime: {
            type: Number,
            required: false,
        },
    },
    mounted() {
        this.refreshSongList();
    },
    computed: {
        priviledgeSufficient() {
            const isUpdate = this.songList.find((m) => m.name === this.current.name);
            const user = this.$store.state.userdata && this.$store.state.userdata.user;
            const userRole = user && user.role;
            const userId = user && user.id;
            return (
                !isUpdate || // Additions are always allowed.
                (isUpdate && // updates need some priviledges:
                    (userRole === "admin" ||
                        userRole === "editor" || // you are a superuser
                        (userId && userId.length > 0 && +this.current.creator_id === +userId)))
            );
            // or you created it in the first place.
        },
        currentStartTime: {
            get() {
                return this.currentStartTimeInput;
            },
            set(val) {
                // Mask time input
                this.currentStartTimeInput = maskTimestamp(val);
                // only modify current.start if time is valid
                if (this.checkStartTime(this.currentStartTimeInput)) {
                    const duration = this.current.end - this.current.start;
                    this.current.start = humanToSeconds(this.currentStartTimeInput);
                    this.current.end = this.current.start + duration;
                }
            },
        },
        currentEndTime: {
            get() {
                return `${this.current.end - this.current.start}`;
            },
            set(val: string) {
                if (this.checkEndTime(val)) {
                    if (val.includes(":")) {
                        this.current.end = humanToSeconds(val);
                    } else {
                        this.current.end = this.current.start + +val;
                    }
                }
            },
        },
        canSave() {
            return this.current.end - this.current.start > 0 && this.current.name;
        },
        addOrUpdate() {
            if (this.songList.find((m) => m.name === this.current.name)) {
                return this.$t("editor.music.update");
            }
            return this.$t("editor.music.add");
        },
    },
    methods: {
        setStartTime(seconds) {
            const self = this as any;
            self.currentStartTime = secondsToHuman(seconds);
        },
        processSearch(item) {
            console.log(item);
            const self = this as any;
            self.current.song = item;
            if (item) {
                self.current.itunesid = item.trackId;
                self.current.name = item.trackName;
                self.current.original_artist = item.artistName;
                self.currentEndTime = `+${Math.ceil(item.trackTimeMillis / 1000)}`;
                self.current.amUrl = item.trackViewUrl;
                self.current.art = item.artworkUrl100;
            } else {
                self.current.itunesid = -1;
                self.current.amUrl = null;
                self.current.art = null;
            }
        },
        checkStartTime(val) {
            return startTimeRegex.test(val);
        },
        checkEndTime(val) {
            return endTimeRegex.test(val);
        },
        secondsToHuman,
        async addSong() {
            const self = this as any;
            await self.saveCurrentSong();
            // this.songList.push(this.current);
            Vue.set(self, "current", getEmptySong(self.video));
            self.$refs.search.query = null;
            await self.refreshSongList();
        },
        async refreshSongList() {
            const self = this as any;
            self.songList = (await backendApi.songListByVideo(self.video.channel.id, self.video.id, false)).data.sort(
                (a, b) => a.start - b.start,
            );
        },
        async saveCurrentSong() {
            const self = this as any;
            const res = await backendApi.tryCreateSong(self.current, this.$store.state.userdata.jwt);
            console.log(res);
        },
        reset() {
            const self = this as any;
            self.current = getEmptySong(self.video);
            self.refreshSongList();
        },
        async removeSong(song) {
            const self = this as any;
            await backendApi.deleteSong(song, this.$store.state.userdata.jwt);
            self.refreshSongList();
        },
        mountTwitter() {
            const externalScript = document.createElement("script");
            externalScript.setAttribute("src", "https://platform.twitter.com/widgets.js");
            externalScript.setAttribute("async", "true");
            document.head.appendChild(externalScript);
        },
    },
};
</script>

<style lang="scss">
.am-listen-btn {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    /* https://css-tricks.com/almanac/properties/w/word-break/ */
    word-break: break-all;
    word-break: break-word;

    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    hyphens: auto;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    justify-content: left;
    text-align: left;
    font-size: small;

    padding-top: 3px !important;
}

.theme--light .tweak-btn {
    background-color: rgb(192, 240, 225);
    color: #444;
    &:hover {
        background-color: rgb(162, 233, 210);
        color: rgb(37, 37, 37);
    }
}

.theme--dark .tweak-btn {
    background-color: rgb(93, 138, 127);
    color: rgb(241, 241, 241);
    &:hover {
        background-color: rgb(73, 107, 96);
        color: rgb(255, 255, 255);
    }
}

.tweak-btn .v-icon {
    color: currentColor !important;
}

button.tweak-btn {
    border-radius: 2px;
    margin: 1px 2px;
    padding: 5px;
    min-width: 50px;
}
.tweak-input {
    margin-left: 2px !important;
    margin-right: 2px !important;
}
.width-auto {
    width: auto !important;
    box-shadow: none;
}
</style>
