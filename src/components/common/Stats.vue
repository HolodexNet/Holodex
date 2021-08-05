<template>
  <v-row>
    <v-col cols="auto">
      <v-card class="stat">
        <div class="text-overline">
          VTubers
        </div>
        <div class="text-h3">
          {{ s.channelCount.vtuber || 0 }}
        </div>
        <div class="green--text text-caption">
          +{{ s.monthlyChannels.vtuber || 0 }} last month
        </div>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card class="stat">
        <div class="text-overline">
          Subbers
        </div>
        <div class="text-h3">
          {{ s.channelCount.subber || 0 }}
        </div>
        <div class="green--text text-caption">
          +{{ s.monthlyChannels.subber || 0 }} last month
        </div>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card class="stat">
        <div class="text-overline">
          Videos
        </div>
        <div class="text-h3">
          {{ s.totalVideos.count || 0 }}
        </div>
        <div class="green--text text-caption">
          +{{ s.dailyVideos.count || 0 }} yesterday
        </div>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card class="stat">
        <div class="text-overline">
          Songs
        </div>
        <div class="text-h3">
          {{ s.totalSongs.count || 0 }}
        </div>
        <div class="green--text text-caption">
          &ensp;
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import backendApi from "@/utils/backend-api";

export default {
    data() {
        return {
            metrics: { statistics: {} },
        };
    },
    computed: {
        s() {
            return this.metrics.statistics || {};
        },
    },
    async mounted() {
        this.metrics = (await backendApi.stats()).data;
    },
};
</script>

<style scoped>
.stat {
  min-width: 140px;
  max-width: 250px;
  display: flex;
  flex-shrink: 1;
  flex-direction: column;
  padding: 15px 20px;
}
small {
    margin: 3px;
    display: inline-block;
    font-family: "Roboto Mono";
    padding: 0px 4px;
    font-size: 75%;
    background-color: #8882;
    border-radius: 2px;
}
small.cat {
    background-color: #3923;
    font-weight: 800;
}
</style>
