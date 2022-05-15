<template>
  <v-col
    v-if="s"
    cols="12"
    md="12"
    lg="9"
    xl="8"
  >
    <v-card
      :class="$vuetify.breakpoint.mobile ? 'flex-column' : null"
      class="d-flex justify-center align-center justify-space-around pt-5 pb-5"
    >
      <!-- VTUBERS -->
      <div
        class="flex-center"
        :style="{ 'width' : getWidth(s.channelCount.vtuber || 0) }"
      >
        <div
          class="num text-h2"
          :value="s.channelCount.vtuber || 0"
        >
          0
        </div>
        <div class="text-overline">
          VTubers
        </div>
        <div class="green--text text-caption">
          +{{ s.monthlyChannels.vtuber || 0 }} last month
        </div>
      </div>
      <!-- SUBBERS -->
      <div
        class="flex-center"
        :class="$vuetify.breakpoint.mobile ? 'mt-5' : null"
        :style="{ 'width' : getWidth(s.channelCount.subber || 0) }"
      >
        <div
          class="num text-h2"
          :value="s.channelCount.subber || 0"
        >
          0
        </div>
        <div class="text-overline">
          Subbers
        </div>
        <div class="green--text text-caption">
          +{{ s.monthlyChannels.subber || 0 }} last month
        </div>
      </div>
      <!-- VIDEOS -->
      <div
        class="flex-center"
        :class="$vuetify.breakpoint.mobile ? 'mt-5' : null"
        :style="{ 'width' : getWidth(s.totalVideos.count || 0) }"
      >
        <div
          class="num text-h2"
          :value="s.totalVideos.count || 0"
        >
          0
        </div>
        <div class="text-overline">
          Videos
        </div>
        <div class="green--text text-caption">
          +{{ s.dailyVideos.count || 0 }} yesterday
        </div>
      </div>
      <!-- SONGS -->
      <div
        class="flex-center"
        :class="$vuetify.breakpoint.mobile ? 'mt-5' : null"
        :style="{ 'width' : getWidth(s.totalSongs.count || 0) }"
      >
        <div
          class="num text-h2"
          :value="s.totalSongs.count || 0"
        >
          0
        </div>
        <div class="text-overline">
          Songs
        </div>
        <div class="green--text text-caption">
          &ensp;
        </div>
      </div>
    </v-card>
  </v-col>
</template>

<script>
import backendApi from "@/utils/backend-api";
import { waitForElement } from "@/utils/functions";

export default {
    data() {
        return {
            metrics: {},
        };
    },
    computed: {
        s() {
            return this.metrics.statistics;
        },
    },
    async mounted() {
        this.metrics = (await backendApi.stats()).data;
        // animate stats
        waitForElement(".text-h2").then(() => {
            const numbers = this.$el.querySelectorAll(".num");
            numbers.forEach((el) => {
                const animate = () => {
                    const value = +el.getAttribute("value");
                    const currVal = +el.innerText;
                    const time = value / 200;

                    if (currVal < value) {
                        el.innerText = Math.ceil(currVal + time);
                        setTimeout(animate, 1);
                    } else {
                        el.innerText = value;
                    }
                };
                animate();
            });
        });
    },
    methods: {
        getWidth(num) {
            return `${num.toString().length * 33.5}px`;
        },
    },
};// k
</script>

<style scoped>
.flex-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 10px 0 10px;
}
</style>
