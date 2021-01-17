<template>
    <v-card>
        <v-card-title class="text-body-1">Comments</v-card-title>
        <v-card-text>
            <v-btn
                class="mr-2 mb-2"
                label
                @click="currentFilter = -1"
                :color="currentFilter === -1 && 'primary darken-1'"
            >
                All ({{ comments.length }})
            </v-btn>
            <template v-for="b in buckets">
                <v-btn
                    class="mr-2 mb-2"
                    :key="b.time"
                    label
                    @click="currentFilter = b.time"
                    :color="currentFilter === b.time && 'primary darken-1'"
                >
                    {{ b.display }} ({{ b.count }})
                </v-btn>
            </template>
            <v-divider />
            <v-list dense class="pa-0 transparent caption" v-if="comments">
                <template v-for="comment in filteredComments">
                    <!-- Render Channel Avatar if necessary -->
                    <!-- <v-list-item class="pa-0"  :key="comment.comment_key"> -->
                    <Comment :comment="comment" :videoId="video.id" :key="comment.comment_key"></Comment>
                    <v-divider style="flex-basis: 100%; height: 0" :key="`divider-${comment.comment_key}`"></v-divider>
                    <!-- </v-list-item> -->
                </template>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
import Comment from "@/components/video/Comment";
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX = /(?:(\d+):)?(\d+):(\d+)/gm;

export default {
    name: "WatchComments",
    components: {
        Comment,
    },
    data() {
        return {
            currentFilter: -1,
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
    },
    mounted() {
        this.$nextTick(() => {
            console.log(this.groupedComments);
            console.log(this.buckets);
        });
    },
    methods: {
        formatDuration,
    },
    computed: {
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
                const times = [];
                while (match != null) {
                    const hr = match[1];
                    const min = match[2];
                    const sec = match[3];
                    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
                    times.push(time);
                    match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
                }
                c.times = times;
                return c;
            });
        },
        buckets() {
            const arr = [];
            this.groupedComments.forEach((c) => {
                arr.push(...c.times);
            });
            arr.sort((a, b) => a - b);
            const buckets = [];
            let currentBucket = 0;
            let subBucket = [];
            arr.forEach((t) => {
                if (t - currentBucket <= 10) {
                    subBucket.push(t);
                } else {
                    if (subBucket.length > 1) {
                        const median = subBucket[Math.floor(subBucket.length / 2)];
                        buckets.push({
                            time: median,
                            count: subBucket.length,
                            display: formatDuration(median * 1000),
                        });
                    }

                    currentBucket = t;
                    subBucket = [];
                    subBucket.push(t);
                }
            });
            return buckets.sort((a, b) => b.count - a.count);
        },
    },
};
</script>

<style></style>
