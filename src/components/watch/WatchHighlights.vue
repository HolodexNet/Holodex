<template>
  <v-card>
    <div class="highlight-container">
      <div class="highlight-bar">
        <template v-for="b in buckets">
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
                <div
                  class="highlight-chip"
                  :style="computeTipStyle(b.time, b.count)"
                />
              </div>
            </template>
            <div class="highlight-comments">
              {{ b.best }}
              <!-- <template v-for="c in b.comments">
                <div :key="c">
                  {{ c }}
                </div>
              </template> -->
            </div>
          </v-tooltip>
        </template>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { formatDuration } from "@/utils/time";

interface ParsedComment {
    time: number;
    occurence: number;
    text?: string;
}

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;

const STOP_WORDS = new Set([
    "to",
    "from",
    "i",
    "for",
    "on",
    "in",
    "out",
    "with",
    "of",
    "an",
    "the",
    "is",
    "have",
    "was",
    "such",
    "her",
    "just",
]);

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
    return (input: string) => input.length >= limit;
}

function parseTimestampComments(message: string): ParsedComment[] {
    const pairs = [];
    let match = COMMENT_TIMESTAMP_REGEX.exec(message);
    while (match != null) {
        const hr = match[1];
        const min = match[2];
        const sec = match[3];
        const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);

        const text = match[4];

        pairs.push({ time, text });

        match = COMMENT_TIMESTAMP_REGEX.exec(message);
    }
    for (const pair of pairs) pair.occurence = pairs.length;
    return pairs;
}

export default {
    name: "WatchHighlights",
    components: {},
    props: {
        comments: {
            type: Array,
            required: true,
        },
        video: {
            type: Object,
            required: true,
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

            const parsed: ParsedComment[] = [];
            for (const comment of this.comments) {
                const pairs = parseTimestampComments(comment.message).filter(
                    (pair) => pair.text,
                );

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

                if (subBucket.length >= MIN_BUCKET_SIZE) {
                    // select floor median has the display time
                    // const median = subBucket[Math.floor(subBucket.length / 2)].time;
                    const th = Math.floor(subBucket.length / 3);
                    const median = subBucket[th].time;

                    // pick best comment to show
                    const processed = subBucket
                        .sort((a, b) => b.occurence - a.occurence) // prioritize chapter comment
                        .map((s) => s.text) // ParsedComment -> string
                        .map(removePunctuations) // remove punctuations
                        .map(removeStopWords) // remove stop words
                        .map((c) => c.trim()) // strip white spaces
                        .filter((c) => c.length > 1); // filter out clutter
                    if (processed.length === 0) return;

                    let best = processed[0];

                    const stricter = processed.filter(filterByWordCount(1)); // remove single word comments
                    if (stricter.length > 0) [best] = stricter;

                    if (best.length > 60) best = `${best.slice(0, 60)}...`;

                    buckets.push({
                        time: median,
                        count: subBucket.length,
                        best,
                        display: formatDuration(median * 1000),
                    });
                }
                // clear and set a new bucket
                currentBucket = comment.time;
                subBucket = [];
                subBucket.push(comment);
            });
            return buckets.sort((a, b) => a.time - b.time);
        },
    },
    methods: {
        formatDuration,
        computeItemStyle(ts: number) {
            return {
                marginLeft: `${Math.round((ts / this.video.duration) * 100)}%`,
            };
        },
        computeTipStyle(ts: number, count: number) {
            let width = "1px";
            let color = "rgb(74, 74, 74)";
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
  height: 5px;
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

.highlight-chip {
  height: 100%;
  transform-origin: center;
  transition: all 0.2s ease-out;
}
</style>
