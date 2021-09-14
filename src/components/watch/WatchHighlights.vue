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
              <template v-for="c in b.comments">
                <div :key="c">
                  {{ c }}
                </div>
              </template>
            </div>
          </v-tooltip>
        </template>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;

function stopWord(word: string) {
    return ![
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
        "is",
        "have",
        "was",
        "such",
        "her",
        "just",
    ].includes(word.toLowerCase());
}

function decompose(input: string) {
    return input
        .replace(/[*',\-.\][()]/g, "")
        .split(" ")
        .filter(stopWord);
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
            const TIME_THRESHOLD = 10;
            const MIN_COMMENTS = 1;

            const arr = this.groupedComments;
            arr.sort((a, b) => a[0] - b[0]);

            const buckets = [];

            let currentBucket = 0;
            let subBucket = [];
            arr.forEach(([t, comment], index) => {
                // put into curent subbucket if time is within 10 secs
                if (t - currentBucket <= TIME_THRESHOLD && index !== arr.length - 1) {
                    subBucket.push([t, comment]);
                    return;
                }
                if (t - currentBucket <= TIME_THRESHOLD) {
                    subBucket.push([t, comment]);
                }
                // only add the bucket if it has more than 0 result
                if (subBucket.length >= MIN_COMMENTS) {
                    // select floor median has the display time
                    const median = subBucket[Math.floor(subBucket.length / 2)][0];
                    buckets.push({
                        time: median,
                        count: subBucket.length,
                        comments: subBucket.map((s) => s[1]),
                        display: formatDuration(median * 1000),
                    });
                }
                // clear and set a new bucket
                currentBucket = t;
                subBucket = [];
                subBucket.push([t, comment]);
            });
            return buckets.sort((a, b) => a.time - b.time);
        },
        groupedComments() {
            const MIN_TIMESTAMPS = 1;
            const result = [];
            for (const comment of this.comments) {
                const ts = [];

                let match = COMMENT_TIMESTAMP_REGEX.exec(comment.message);
                while (match != null) {
                    // analyze timestamp
                    const hr = match[1];
                    const min = match[2];
                    const sec = match[3];
                    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);

                    // analyze comment
                    const text = match[4]
                        ? decompose(match[4].trim()).join(" ")
                        : undefined;

                    if (text) ts.push([time, text]);

                    match = COMMENT_TIMESTAMP_REGEX.exec(comment.message);
                }

                if (ts.length >= MIN_TIMESTAMPS) {
                    result.push(...ts);
                }
            }
            return result;
        },
    },
    methods: {
        formatDuration,
        computeItemStyle(ts: number) {
            return {
                marginLeft: `${Math.floor((ts / this.video.duration) * 100)}%`,
            };
        },
        computeTipStyle(ts: number, count: number) {
            let width = 2;
            let color = "rgb(74, 74, 74)";
            if (count > 1) {
                color = "#ededed";
            }
            if (count > 2) {
                color = "darkorange";
            }
            if (count > 3) {
                width = 3;
                color = "orange";
            }
            if (count > 4) {
                width = 4;
                color = "#d05b5b";
            }
            if (count > 5) {
                width = 5;
                color = "red";
            }
            return {
                width: `${width}px`,
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
  --marginSize: 4px;
  height: 100%;
  position: absolute;
  display: flex;
  padding: 0 20px 0 var(--marginSize);
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
