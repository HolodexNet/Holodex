<template>
  <v-card>
    <v-card-title class="text-body-1">
      {{ $t("component.watch.Comments.highlights") }}
    </v-card-title>
    <v-card-text>
      <template v-for="b in buckets2">
        <div :key="b.display">
          <a
            class="comment-chip"
            :href="'?t=' + b.time"
            :data-time="b.time"
            @click.prevent="handleClick"
          >
            {{ b.comments[0] }}
          </a>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
// import Comment from "@/components/video/Comment.vue";
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;

export default {
    name: "WatchComments",
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
            currentFilter: -1,
            expanded: false,
        };
    },
    computed: {
        shouldLimit() {
            return this.limit && this.filteredComments.length > this.limit;
        },
        limitComment() {
            return this.shouldLimit && !this.expanded
                ? this.filteredComments.slice(0).splice(0, this.limit)
                : this.filteredComments;
        },
        filteredComments() {
            if (this.currentFilter < 0) {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                return this.groupedComments.sort(
                    (a, b) => b.times.length - a.times.length,
                );
            }
            return this.comments
                .filter((c) => c.times.find((t) => Math.abs(this.currentFilter - t) <= 10))
                .sort((a, b) => a.times.length - b.times.length);
        },
        groupedComments() {
            const grouped = this.comments.map((c) => {
                // console.log(c);
                let match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
                const times = new Set();
                while (match != null) {
                    // analyze timestamp
                    const hr = match[1];
                    const min = match[2];
                    const sec = match[3];
                    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                    times.add(time);

                    // next match
                    match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
                }
                c.times = Array.from(times);
                return c;
            });
            return grouped;
        },
        buckets() {
            console.log(this.buckets2);
            const arr = [];
            // extract all timestamps from each comment and sort
            this.groupedComments.forEach((c) => {
                arr.push(...c.times);
            });
            arr.sort((a, b) => a - b);

            const buckets = [];
            // push default bucket All comments filter
            buckets.push({
                time: -1,
                count: this.comments.length,
                display: `${this.$t("component.watch.Comments.all")}`,
            });

            let currentBucket = 0;
            let subBucket = [];
            arr.forEach((t, index) => {
                // put into curent subbucket if time is within 10 secs
                if (t - currentBucket <= 10 && index !== arr.length - 1) {
                    subBucket.push(t);
                    return;
                }
                if (t - currentBucket <= 10) {
                    subBucket.push(t);
                }
                // only add the bucket if it has more than one result
                if (subBucket.length > 1) {
                    // select floor median has the display time
                    const median = subBucket[Math.floor(subBucket.length / 2)];
                    buckets.push({
                        time: median,
                        count: subBucket.length,
                        display: formatDuration(median * 1000),
                    });
                }
                // clear and set a new bucket
                currentBucket = t;
                subBucket = [];
                subBucket.push(t);
            });
            return buckets.sort((a, b) => b.count - a.count);
        },
        buckets2() {
            const arr = this.groupedComments2;
            arr.sort((a, b) => a[0] - b[0]);

            const buckets = [];

            let currentBucket = 0;
            let subBucket = [];
            arr.forEach(([t, comment], index) => {
                // put into curent subbucket if time is within 10 secs
                if (t - currentBucket <= 10 && index !== arr.length - 1) {
                    subBucket.push([t, comment]);
                    return;
                }
                if (t - currentBucket <= 10) {
                    subBucket.push([t, comment]);
                }
                // only add the bucket if it has more than 0 result
                if (subBucket.length > 1) {
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
        groupedComments2() {
            const tc = [];
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
                }

                if (ts.length > 3) {
                    tc.push(...ts);
                }

                match = COMMENT_TIMESTAMP_REGEX.exec(comment.message);
            }
            return tc;
        },
    },
    methods: {
        formatDuration,
        handleClick(e) {
            if (e.target.matches(".comment-chip")) {
                this.$emit("timeJump", e.target.getAttribute("data-time"), true, true);
                // timeJump, timestamp, playNow = true, updateStartTime = true
                e.preventDefault();
            }
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
</style>
