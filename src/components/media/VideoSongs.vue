<template>
    <div>
        <v-row align="center">
            <v-divider></v-divider><span class="text-overline">Song Metadata: Add a new Song</span
            ><v-divider></v-divider>
        </v-row>
        <v-row dense>
            <v-col cols="8" sm="9" md="10" lg="5">
                <song-search :value="current.song" :id="current.itunesid" @input="processSearch"></song-search>
            </v-col>
            <v-col cols="4" sm="3" md="2" lg="1">
                <v-text-field
                    outlined
                    readonly
                    disabled
                    label="TrackId"
                    hide-details="auto"
                    :value="current.id || 'N/A'"
                    style="font-size: 12px"
                />
            </v-col>
            <v-col cols="12" sm="7" md="4" lg="6">
                <v-text-field outlined label="Track Name" hide-details="auto" v-model="current.name" />
            </v-col>
            <v-col cols="12" sm="5" md="4" lg="6">
                <v-text-field outlined label="Original Artist" hide-details="auto" v-model="current.originalArtist" />
            </v-col>
            <v-col cols="6" sm="4" md="2" lg="3">
                <v-text-field
                    outlined
                    label="Start"
                    placeholder="12:31"
                    hide-details="auto"
                    :append-icon="mdiEarHearing"
                    v-model="currentStartTime"
                    :rules="[checkStartTime]"
                    validate-on-blur
                >
                </v-text-field>
            </v-col>
            <v-col cols="6" sm="4" md="2" lg="3">
                <v-text-field
                    outlined
                    :label="`End / Duration ${secondsToHuman(current.end)}`"
                    placeholder="3:40 or +312"
                    hide-details="auto"
                    :append-icon="mdiEarHearing"
                    v-model="currentEndTime"
                    :rules="[checkEndTime]"
                    validate-on-blur
                >
                </v-text-field>
            </v-col>
            <v-col cols="4" sm="6" md="8">
                <v-btn color="success" elevation="5" width="100%" @click="addSong" :disabled="!canSave">Add</v-btn>
            </v-col>
            <v-col cols="2" sm="2" md="1">
                <v-btn color="red" elevation="5" width="100%" style="padding: 0 0px; min-width: 30px">
                    <v-icon>{{ mdiRestore }}</v-icon>
                </v-btn>
            </v-col>
            <v-col cols="6" sm="4" md="3">
                <v-btn elevation="5" width="100%" class="am-listen-btn">
                    <v-avatar left tile size="26px">
                        <v-img
                            src="https://apple-resources.s3.amazonaws.com/medusa/production/images/5f600674c4f022000191d6c4/en-us-large@1x.png"
                        ></v-img>
                    </v-avatar>
                    <span class="ml-2" style="font-size: 0.7rem">Listen on Apple Music</span>
                </v-btn>
            </v-col>
        </v-row>
        <v-row class="pt-3">
            <v-col cols="12">
                <v-list>
                    <template v-for="song in songList">
                        <song-item :song="song" :key="song.name"></song-item>
                    </template>
                </v-list>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mdiEarHearing, mdiRestore } from "@mdi/js";
import SongSearch from "./SongSearch";
import SongItem from "./SongItem";

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

function secondsToHuman(s) {
    return new Date(s * 1000).toISOString().substr(11, 8);
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
        originalArtist: "",
        amUrl: null,
        art: null,
        video_id: video.id,
        channel_id: video.channel_id,
        channel: {
            name: video.channel.name,
            name_en: video.channel.name_en,
        },
        available_at: video.available_at,
    };
}

export default {
    components: {
        SongSearch,
        SongItem,
    },
    data() {
        return {
            mdiEarHearing,
            mdiRestore,
            current: getEmptySong(this.video),
            songList: [],
        };
    },
    props: {
        video: {
            type: Object,
            required: true,
        },
    },
    computed: {
        currentStartTime: {
            get() {
                return secondsToHuman(this.current.start);
            },
            set(val) {
                if (this.checkStartTime(val)) {
                    const duration = this.current.end - this.current.start;
                    this.current.start = humanToSeconds(val);
                    this.current.end = this.current.start + duration;
                }
            },
        },
        currentEndTime: {
            get() {
                return `+${this.current.end - this.current.start}`;
            },
            set(val) {
                if (this.checkEndTime(val)) {
                    if (val.startsWith("+")) {
                        this.current.end = this.current.start + +val.slice(1);
                    } else {
                        this.current.end = humanToSeconds(val);
                    }
                }
            },
        },
        canSave() {
            return this.current.end - this.current.start > 0 && this.current.name;
        },
    },
    methods: {
        processSearch(item) {
            console.log(item);
            this.current.song = item;
            if (item) {
                this.current.itunesid = item.trackId;
                this.current.name = item.trackName;
                this.current.originalArtist = item.artistName;
                this.currentEndTime = `+${Math.ceil(item.trackTimeMillis / 1000)}`;
                this.current.amUrl = item.trackViewUrl;
                this.current.art = item.artworkUrl100;
            } else {
                this.current.itunesid = -1;
                this.current.amUrl = null;
                this.current.art = null;
            }
        },
        checkStartTime(val) {
            return startTimeRegex.test(val);
        },
        checkEndTime(val) {
            return endTimeRegex.test(val);
        },
        secondsToHuman,
        addSong() {
            this.songList.push(this.current);
            this.current = getEmptySong(this.video);
        },
    },
};
</script>

<style>
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
}
</style>
