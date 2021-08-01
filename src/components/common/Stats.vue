<template>
  <div class="text-center text-body-2 mt-8 mb-2">
    <small class="cat">Channels</small>
    <small>1d
      <span class="green--text">
        &#127483;&#8201;+{{ s.dailyChannels.vtuber || 0 }} 🎬+{{ s.dailyChannels.subber || 0 }}
      </span></small>
    <small>30d
      <span class="green--text">
        &#127483;&#8201;+{{ s.monthlyChannels.vtuber || 0 }} 🎬+{{ s.monthlyChannels.subber || 0 }}
      </span></small>
    <small>All
      <span class="">
        &#127483; <b>{{ s.channelCount.vtuber || 0 }}</b> 🎬 <b>{{ s.channelCount.subber || 0 }}</b>
      </span></small>
    -------
    <small class="cat">Videos</small>
    <small>1d <span class="green--text">+{{ s.dailyVideos.count }} </span></small>
    <small>All <b>{{ s.totalVideos.count }}</b></small>
  </div>
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
