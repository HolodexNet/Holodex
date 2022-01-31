<template>
  <v-expansion-panels :value="0">
    <v-expansion-panel>
      <v-expansion-panel-header class="text-body-1">
        Automated Comment Song Helper
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <h5>1: Click on Searchable Component</h5>
        <div v-for="(timeframe,idx) in selection" :key="'s'+timeframe.index">
          <a href="#">
            <v-chip outlined label @click="$emit('songSelected', timeframe)">[{{ timeframe.start_human + (timeframe.end_time?'\t- '+timeframe.end_human : '\t- ?') }}]</v-chip>
            <v-chip
              v-for="(token,tokenidx) in timeframe.tokens"
              :key="'s'+timeframe.index+'t'+tokenidx"
              class="ma-1"
              outlined
              label
              href="#"
              @click="tryLooking(timeframe,token, idx)"
            >{{ token }}</v-chip>
          </a>
          <div v-if="idx === searchResultIdx">
            <div style="width: 100%; justify-content:flex-end; display: flex; flex-direction:row; ">
              <v-btn
                icon
                x-small
                @click="searchResultIdx = -1"
              >
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </div>
            <h5 class="grey darken-2 rounded px-2">
              Pick either iTunes result
            </h5>
            <v-list>
              <v-list-item v-for="x in searchResult" :key="'itn'+x.trackId" @click="$emit('songSelected', timeframe, x)">
                <v-list-item-avatar tile>
                  <v-img :src="x.artworkUrl100" />
                </v-list-item-avatar>

                <v-list-item-content class="py-1 pt-1">
                  <v-list-item-subtitle class="text--primary">
                    🎵 {{ x.trackName }} [{{ formatDuration(x.trackTimeMillis) }}]
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text--caption">
                    🎤 {{ x.artistName }} / {{ x.collectionName }} / {{ x.releaseDate ? x.releaseDate.slice(0, 7) : "" }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <h5 class="grey darken-2 rounded px-2">
              Or pick existing Musicdex Track:
            </h5>
            <v-list>
              <v-list-item v-for="(x,a) in searchResultMD" :key="'mdx'+x.trackId+'.'+a" @click="$emit('songSelected', timeframe, x)">
                <v-list-item-avatar tile>
                  <v-img :src="x.artworkUrl100" />
                </v-list-item-avatar>

                <v-list-item-content class="py-1 pt-1">
                  <v-list-item-subtitle class="text--primary">
                    🎵 {{ x.trackName }} [{{ formatDuration(x.trackTimeMillis) }}]
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text--caption">
                    🎤 {{ x.artistName }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import jsonp from "jsonp-es6";
import { compareTwoStrings } from "string-similarity";
import { formatDuration } from "@/utils/time";
import { axiosInstance } from "@/utils/backend-api";
// const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm;
// eslint-disable-next-line max-len
const TS_PARSING_REGEX = /(?<pre>.*?)(?:(?<s_h>[0-5]?[0-9]):)?(?<s_m>[0-5]?[0-9]):(?<s_s>[0-5][0-9])(?:(?<mid>.*?)(?:(?:(?<e_h>[0-5]?[0-9]):)?(?<e_m>[0-5]?[0-9]):(?<e_s>[0-5][0-9])))?(?<post>.*?)?$/gm;

function capgroupToSecs(h, m, s) {
    if (!h && !m && !s) return undefined;
    return +(h || 0) * 3600 + +(m || 0) * 60 + +(s || 0);
}
export default {
    props: { comments: { type: Array, required: true } },
    data() {
        return { selection: [],

                 searchResult: [],
                 searchResultMD: [],
                 searchResultIdx: -1,
                 searchStart: 0,
                 searchEnd: 0 };
    },
    async mounted() {
        if (this.comments && this.comments.length > 0) {
            // eslint-disable-next-line camelcase
            const chosen = this.comments.map(({ comment_key, message }) => {
                const groups = message.match(TS_PARSING_REGEX);
                return { comment_key, message, sz: groups.length };
            }).sort((a, b) => b.sz - a.sz)[0];

            if (chosen.sz === 0) return;

            const match = [...chosen.message.matchAll(TS_PARSING_REGEX)];

            console.log(match);

            this.selection = match.map(({ index, groups: g }) => {
                const x = { index,
                            start_human: `${g.s_h ? `${g.s_h}:` : ""}${g.s_m}:${g.s_s}`,
                            start_time: capgroupToSecs(g.s_h, g.s_m, g.s_s),
                            end_human: `${g.e_h ? `${g.e_h}:` : ""}${g.e_m}:${g.e_s}`,
                            end_time: capgroupToSecs(g.e_h, g.e_m, g.e_s),
                            tokens: [g.pre, g.mid, g.post].join(" / ").split(/[|\-/.()]|by/).map((a) => a.trim())
                                .filter((x) => x.length > 1) };
                console.log(x);
                return x;
            });
        }
    },
    methods: {
        async getAutocomplete(query) {
            // this.isLoading = true;
            const res = await this.searchAutocomplete(query, "ja_jp");
            const resEn = await this.searchAutocomplete(query, "en_us");
            const lookupEn = resEn.results || [];
            console.log(lookupEn);
            const fnLookupFn = (id, name) => {
                const foundEn = lookupEn.find((x) => x.trackId === id);
                if (foundEn && foundEn.trackName !== name && compareTwoStrings(foundEn.trackName, name) < 0.2) {
                    return `${name} / ${foundEn.trackName}`;
                }
                return name;
            };
            if (res && res.results) {
                // console.log(res.results);
                return res.results.map(
                    ({
                        trackId,
                        collectionName,
                        releaseDate,
                        artistName,
                        trackName,
                        trackTimeMillis,
                        artworkUrl100,
                        trackViewUrl,
                    }) => ({
                        trackId,
                        trackTimeMillis,
                        collectionName,
                        releaseDate,
                        artistName,
                        trackName: fnLookupFn(trackId, trackName),
                        artworkUrl100,
                        trackViewUrl,
                    }),
                );
            }
            // this.isLoading = false;
            // console.log(res);
            return [];
        },

        async searchMusicdex(query) {
            try {
                const resp = await axiosInstance({ url: "https://staging.holodex.net/api/v2/musicdex/search", method: "POST", data: { q: query } });
                return resp?.data?.hits?.map(({ document }) => ({
                    trackId: document.itunesid,
                    artistName: document.original_artist,
                    trackName: document.name,
                    trackTimeMillis: (document.end - document.start) * 1000,
                    trackViewUrl: document.amUrl,
                    artworkUrl100: document.art,
                })) || [];
            } catch (e) {
                console.error(e);
                return [];
            }
        },

        async searchAutocomplete(query, lang = "ja_jp") {
            return jsonp("https://itunes.apple.com/search", {
                term: query,
                entity: "musicTrack",
                country: "JP",
                limit: 3,
                lang,
            });
        },

        async tryLooking({ index, start_time, end_time, tokens }, token, idx) {
            console.log(tokens);

            // const nonSplit = tokens;
            // const splitByStuff = tokens.split(/[|\-/.()]|by/);

            const [a, b] = await Promise.all([this.getAutocomplete(token), this.searchMusicdex(tokens.join(" "))]);

            this.searchResult = a;
            this.searchResultMD = b;
            this.searchResultIdx = idx;
            this.searchStart = start_time;
            this.searchEnd = end_time;
        },

        formatDuration,
    },
};
</script>

<style>

</style>
