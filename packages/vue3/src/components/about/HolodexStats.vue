<template>
  <v-col v-if="s" cols="12" md="12" lg="9" xl="8">
    <div
      class="stats stats-vertical lg:stats-horizontal drop-shadow-lg bg-base-300"
    >
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">VTubers</div>
        <div
          class="stat-value text-primary"
          :value="s.channelCount.vtuber || 0"
        >
          0
        </div>
        <div class="stat-desc">
          +{{ s.monthlyChannels.vtuber || 0 }} last month
        </div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Subbers</div>
        <div
          class="stat-value text-secondary"
          :value="s.channelCount.subber || 0"
        >
          0
        </div>
        <div class="stat-desc">
          +{{ s.monthlyChannels.vtuber || 0 }} last month
        </div>
      </div>
      <div class="stat">
        <div class="stat-figure text-success">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Videos</div>
        <div class="stat-value text-success" :value="s.totalVideos.count || 0">
          0
        </div>
        <div class="stat-desc">+{{ s.dailyVideos.count || 0 }} yesterday</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-warning">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Songs</div>
        <div class="stat-value text-warning" :value="s.totalSongs.count || 0">
          0
        </div>
        <div class="stat-desc"></div>
      </div>
    </div>
  </v-col>
</template>

<script>
import backendApi from "@/utils/backend-api";
import { useDisplay } from "vuetify";
import { waitForElement } from "@/utils/functions";

export default defineComponent({
  setup() {
    const display = useDisplay();

    const metrics = ref({});

    backendApi.stats().then(({ data }) => (metrics.value = data));
    // animate stats
    waitForElement(".stat-value").then(() => {
      const numbers = document.querySelectorAll(".stat-value");
      numbers.forEach((el) => {
        const animate = () => {
          const value = +el.getAttribute("value");
          const currVal = +el.innerText;
          const time = value / 60;

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
    return { display, metrics };
  },
  computed: {
    s() {
      return this.metrics?.statistics;
    },
  },
  methods: {},
});
</script>

<style></style>
