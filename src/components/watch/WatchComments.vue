<template>
    <v-card>
        <v-card-title class="text-body-1">Comments</v-card-title>
        <v-card-text>
            <template v-for="b in buckets">
                <v-btn
                    class="mr-2 mb-2"
                    :key="b.time"
                    label
                    @click="currentFilter = b.time"
                    :color="currentFilter === b.time ? 'primary darken-1' : ''"
                    small
                >
                    {{ b.display }} ({{ b.count }})
                </v-btn>
            </template>
            <v-divider />
            <v-list dense class="pa-0 transparent caption" v-if="comments" @click.native="handleClick">
                <template v-for="comment in limitComment">
                    <Comment :comment="comment" :videoId="video.id" :key="comment.comment_key"></Comment>
                </template>
            </v-list>
            <v-btn plain small text @click="expanded = !expanded" v-if="shouldLimit">
                {{ expanded ? $t("views.app.close_btn") : $t("component.description.showMore") }}</v-btn
            >
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Comment from "@/components/video/Comment.vue";
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm;

export default {
    name: "WatchComments",
    components: {
        Comment,
    },
    data() {
        return {
            currentFilter: -1,
            expanded: false,
        };
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
    },
    methods: {
        formatDuration,
        handleClick(e) {
            if (e.target.matches(".comment-chip")) {
                this.$emit("timeJump", e.target.getAttribute("data-time"));
                e.preventDefault();
            }
        },
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
                return this.comments.sort((a, b) => b.times.length - a.times.length);
            }
            return this.comments
                .filter((c) => c.times.find((t) => Math.abs(this.currentFilter - t) <= 10))
                .sort((a, b) => a.times.length - b.times.length);
        },
        groupedComments() {
            return this.comments.map((c) => {
                // console.log(c);
                let match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
                const times = new Set();
                while (match != null) {
                    const hr = match[1];
                    const min = match[2];
                    const sec = match[3];
                    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                    times.add(time);
                    match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
                }
                c.times = Array.from(times);
                return c;
            });
        },
        buckets() {
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
                display: "All",
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
    },
};
</script>

<style></style>
