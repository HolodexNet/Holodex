<template>
  <v-expansion-panels :value="defaultExpanded ? 0 : undefined">
    <v-expansion-panel>
      <v-expansion-panel-header class="text-body-1">
        {{ $t("component.watch.Comments.title") }} ({{ comments.length }})
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <template v-if="!hideBuckets">
          <template v-for="b in buckets">
            <v-btn
              :key="b.time"
              class="mr-2 mb-2 ts-btn"
              label
              :color="currentFilter === b.time ? 'primary darken-1' : ''"
              small
              @click="currentFilter = b.time"
            >
              {{ b.display }} ({{ b.count }})
            </v-btn>
          </template>
        </template>
        <v-divider />
        <v-list
          v-if="comments"
          dense
          class="pa-0 transparent caption"
          @click.native="handleClick"
        >
          <template v-for="comment in limitComment">
            <Comment
              :key="comment.comment_key"
              :comment="comment"
              :video-id="video.id"
            />
          </template>
        </v-list>
        <v-btn
          v-if="shouldLimit"
          plain
          small
          text
          @click="expanded = !expanded"
        >
          {{
            expanded
              ? $t("views.app.close_btn")
              : $t("component.description.showMore")
          }}
        </v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import Comment from "@/components/video/Comment.vue";
import { formatDuration } from "@/utils/time";

const COMMENT_TIMESTAMP_REGEX =
  /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/gm;

export default defineComponent({
  name: "WatchComments",
  components: {
    Comment,
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
    defaultExpanded: {
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
          (a, b) => b.times.length - a.times.length
        );
      }
      return this.comments
        .filter((c) =>
          c.times.find((t) => Math.abs(this.currentFilter - t) <= 10)
        )
        .sort((a, b) => a.times.length - b.times.length);
    },
    groupedComments() {
      const { duration } = this.video;
      return this.comments.map((c) => {
        // console.log(c);
        let match = COMMENT_TIMESTAMP_REGEX.exec(c.message);
        const times = new Set();
        while (match != null) {
          const hr = match[1];
          const min = match[2];
          const sec = match[3];
          const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
          if (time < duration) {
            times.add(time);
          }
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
});
</script>
<style>
button.ts-btn.v-btn {
  font-size: 11px;
  padding: 0px 5px !important;
  height: 25px !important;
}
</style>
