<template>
  <v-card>
    <div class="highlight-container">
      <div class="highlight-bar">
        <template v-for="b in buckets">
          <v-tooltip :key="b.display" bottom>
            <template #activator="{ on, attrs }">
              <div
                v-bind="attrs"
                class="highlight-chip"
                :style="computeStyle(b.time, b.count)"
                @click.prevent="jump(b.time)"
                v-on="on"
              />
            </template>
            <div>
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
// import Comment from "@/components/video/Comment.vue";
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;

export default {
    name: "WatchHighlights",
    components: {
    // Comment,
    },
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
            required: false,
            default: 3,
        },
        hideBuckets: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            //   currentFilter: -1,
            //   expanded: false,
        };
    },
    computed: {
        buckets() {
            console.log(this.video.duration);
            const TIME_THRESHOLD = 5;
            const MIN_COMMENTS = 2;

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
            console.log(buckets);
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
                    const text = match[4] ? match[4].trim() : undefined;
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
        computeStyle(ts: number, count: number) {
            let width = 2;
            let color = "gray";
            if (count > 2) {
                color = "darkorange";
            }
            if (count > 3) {
                width = 3;
                color = "orange";
            }
            if (count > 4) {
                width = 4;
                color = "darkred";
            }
            if (count > 5) {
                width = 5;
                color = "red";
            }
            return {
                width: `${width}px`,
                marginLeft: `${Math.floor((ts / this.video.duration) * 100)}%`,
                backgroundColor: color,
            };
        },
        jump(ts: number) {
            this.$emit("timeJump", ts, true, true);
        },
    },
};

// function decompose(input: string) {
//   return input.replace(/['",]/, "").split(" ").filter(stopWord);
// }

// function stopWord(word: string) {
//   return ![
//     "to",
//     "from",
//     "i",
//     "for",
//     "on",
//     "in",
//     "out",
//     "with",
//     "of",
//     "an",
//     "is",
//     "have",
//     "was",
//     "such",
//     "her",
//     "just",
//   ].includes(word.toLowerCase());
// }
</script>
<style>
button.ts-btn.v-btn {
  font-size: 11px;
  padding: 0px 5px !important;
  height: 25px !important;
}

.highlight-container {
  padding: 12px;
}

.highlight-bar {
  width: 100%;
  height: 20px;
  background: black;
  display: flex;
  position: relative;
}

.highlight-chip {
  height: 100%;
  position: absolute;
  /* margin-left: 0%; */
}
</style>
