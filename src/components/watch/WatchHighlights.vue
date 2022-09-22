<template>
  <v-sheet>
    <div v-if="bucketsFiltered.length > 0" class="highlight-container">
      <div class="highlight-bar">
        <template v-for="b in bucketsFiltered">
          <v-tooltip
            :key="b.display"
            top
            color="black"
            transition="undefined"
          >
            <template #activator="{ on, attrs }">
              <div
                v-bind="attrs"
                class="highlight-item"
                :style="computeItemStyle(b.time)"
                v-on="on"
                @click.prevent="jump(b.time)"
              >
                <div class="highlight-chip" :style="computeTipStyle(b)" />
              </div>
            </template>
            <div v-if="b.best" class="highlight-comments">
              <time :datetime="b.absolute">{{ b.display }}</time>
              {{ b.best }}
            </div>
            <song-item
              v-else-if="b.song"
              :song="b.song"
              color="white--text"
            />
          </v-tooltip>
        </template>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { formatDuration } from "@/utils/time";
import SongItem from "../media/SongItem.vue";

interface ParsedComment {
    time: number;
    occurence: number;
    text?: string;
    song?: any;
}

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;

const STOP_WORDS = new Set(["an", "the"]);

function removeStopWords(words: string) {
    return words
        .split(" ")
        .filter((s) => !STOP_WORDS.has(s.toLowerCase()))
        .join(" ");
}

function removePunctuations(input: string) {
    return input.replace(/[*,\-.\][()、。]/g, "");
}

function filterByWordCount(limit = 2) {
    return (input: string) => input.split(" ").length >= limit;
}

function parseTimestampComments(
    message: string,
    videoDuration: Number,
): ParsedComment[] {
    const pairs = [];
    let match = COMMENT_TIMESTAMP_REGEX.exec(message);
    while (match != null) {
        const hr = match[1];
        const min = match[2];
        const sec = match[3];
        const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);

        const text = match[4];

        if (time < videoDuration) {
            pairs.push({ time, text });
        }

        match = COMMENT_TIMESTAMP_REGEX.exec(message);
    }
    for (const pair of pairs) pair.occurence = pairs.length;
    return pairs;
}

export default {
    name: "WatchHighlights",
    components: { SongItem },
    props: {
        comments: {
            type: Array,
            required: true,
        },
        video: {
            type: Object,
            required: true,
        },
        limit: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {};
    },
    computed: {
        buckets() {
            const TIME_THRESHOLD = 40;
            const MIN_BUCKET_SIZE = 1;
            const MIN_TIMESTAMP_OCCURENCE = 1;
            const VIDEO_START_TIMESTAMP = +new Date(
                this.video.start_actual || this.video.available_at,
            );

            const parsed: ParsedComment[] = [];
            for (const comment of this.comments) {
                const pairs = parseTimestampComments(
                    comment.message,
                    this.video.duration,
                ).filter((pair) => pair.text);

                if (pairs.length >= MIN_TIMESTAMP_OCCURENCE) {
                    parsed.push(...pairs);
                }
            }

            parsed.sort((a, b) => a.time - b.time);

            const buckets = [];
            let currentBucket = 0;
            let subBucket: ParsedComment[] = [];

            parsed.forEach((comment, index) => {
                // put into curent subbucket if time is within 10 secs
                if (
                    comment.time - currentBucket <= TIME_THRESHOLD
                    && index !== parsed.length - 1
                ) {
                    subBucket.push(comment);
                    return;
                }
                if (comment.time - currentBucket <= TIME_THRESHOLD) {
                    subBucket.push(comment);
                }
                /**
                 * Process the bucket
                 */
                if (subBucket.length >= MIN_BUCKET_SIZE) {
                    // select floor median has the display time
                    const th = Math.floor(subBucket.length / 3);
                    const median = subBucket[th].time;
                    // Find matching song around timestamp
                    const matchingSong = this.video?.songs?.find(
                        (song) => Math.abs(song.start - median) <= TIME_THRESHOLD,
                    );
                    if (!matchingSong) {
                        // pick best comment to show
                        const processed = subBucket
                            .sort(
                                (a, b) => b.occurence / b.text.length - a.occurence / a.text.length,
                            ) // prioritize chapter comment
                            .map((s) => s.text) // ParsedComment -> string
                            .map(removePunctuations) // remove punctuations
                            .map(removeStopWords) // remove stop words
                            .map((c) => c.trim()) // strip white spaces
                            .filter((c) => c.length > 1); // filter out clutter

                        if (processed.length > 0) {
                            let best = processed[0];

                            const stricter = processed
                                .filter(filterByWordCount(2))
                                .filter((c) => !/(?:clip\s?(?:it|this)|[!?]{3})/i.test(c));
                            // console.log(stricter);
                            if (stricter.length > 0) [best] = stricter;

                            if (best.length > 60) best = `${best.slice(0, 60)}...`;

                            const medianMS = median * 1000;
                            const absolute = new Date(
                                VIDEO_START_TIMESTAMP + medianMS,
                            ).toISOString();
                            // console.log(best, processed);
                            buckets.push({
                                time: median,
                                count: subBucket.length,
                                best,
                                display: formatDuration(medianMS),
                                absolute,
                            });
                        }
                    }
                }
                // clear and set a new bucket
                currentBucket = comment.time;
                subBucket = [];
                subBucket.push(comment);
            });

            // Render song item instead of text
            buckets.push(
                ...(this.video.songs?.map((song) => ({
                    time: song.start,
                    count: subBucket.length,
                    song: {
                        ...song,
                        channel: this.video.channel,
                    },
                    display: formatDuration(song.start * 1000),
                })) || []),
            );
            return buckets;
        },
        bucketsFiltered() {
            if (this.limit) {
                const buckets = [...this.buckets];
                let cnt = 0;
                return buckets.filter((b) => {
                    if (b.song) return true;
                    if (cnt < this.limit) {
                        cnt += 1;
                        return true;
                    }
                    return false;
                });
            }
            return this.buckets;
        },
    },
    methods: {
        formatDuration,
        computeItemStyle(ts: number) {
            return {
                marginLeft: `${Math.round((ts / this.video.duration) * 100)}%`,
            };
        },
        computeTipStyle(bucket) {
            const { count } = bucket;
            let width = "1px";
            let color = "rgb(100, 100, 100)";
            if (bucket.song) {
                width = "3px";
                color = "var(--v-primary-base)";
            }
            if (count > 1) {
                width = "2px";
                color = "rgb(164, 164, 164)";
            }
            if (count > 2) {
                color = "darkorange";
            }
            if (count > 3) {
                color = "orange";
            }
            if (count > 4) {
                color = "#d05b5b";
            }
            if (count > 5) {
                color = "red";
            }
            return {
                width,
                backgroundColor: color,
            };
        },
        jump(ts: number) {
            this.$emit("timeJump", ts, true, true);
        },
    },
};
</script>
<style lang="scss">
.highlight-container {
  padding: 12px;
  height: 30px;
  transition: all 0.2s ease-out;

  &:hover {
    .highlight-bar {
      height: 15px;
    }
  }
}

.highlight-bar {
  width: 100%;
  height: 10px;
  position: relative;
  transition: all 0.2s ease-out;
  cursor: pointer;
}

.highlight-item {
  --marginSize: 3px;
  height: 100%;
  position: absolute;
  display: flex;
  padding: 0 20px 0 var(--marginSize);
  /* padding: 0 20px 0 0; */
  transform: translateX(calc(-1 * var(--marginSize)));
  &:hover {
    .highlight-chip {
      transform: scaleX(2);
    }
  }
}

.highlight-comments {
  margin-top: 2px;
}

.highlight-comments > time {
  display: block;
  font-family: monospace;
  font-size: 0.7em;
  line-height: 1em;
  opacity: 0.5;
}

.highlight-chip {
  height: 100%;
  transform-origin: center;
  transition: all 0.2s ease-out;
}
</style>
