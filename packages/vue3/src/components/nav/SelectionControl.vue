<template>
  <v-footer id="selectionFooter" app>
    <div class="btn btn-square btn-xs btn-ghost self-start">
      <div class="i-mdi:close-circle" @click="exit"></div>
    </div>

    <v-window v-model="page" direction="vertical">
      <v-window-item :value="0">
        <div class="flex flex-row gap-2 flex-wrap">
          <div
            class="btn-group btn-group-vertical sm:btn-group-horizontal self-start"
          >
            <div
              class="btn btn-xs btn-ghost btn-secondary cursor-default btn-disabled pointer-events-auto pr-0"
            >
              <span class="text-xs font-normal text-primary-300">
                Selected
                <span class="text-primary">{{
                  selection.selectedVideos.length
                }}</span>
                videos</span
              >
              <a
                class="btn btn-square btn-xs btn-link self-start"
                @click="selection.selectedVideos = []"
              >
                <div class="i-material-symbols:deselect"></div>
              </a>
            </div>

            <div class="btn btn-xs btn-secondary btn-outline">
              Open in Multiview
            </div>
            <div class="btn btn-xs btn-secondary btn-outline">
              Add to current Playlist
            </div>
            <div class="btn btn-xs btn-secondary btn-outline">
              Make into new Playlist
            </div>
          </div>
          <div
            class="btn-group btn-group-vertical sm:btn-group-horizontal self-start"
          >
            <div
              class="btn btn-xs btn-ghost btn-secondary font-normal"
              disabled
              aria-disabled
            >
              <span class="text-primary-300">Group Edit:</span>
            </div>
            <div class="btn btn-xs btn-secondary btn-outline" @click="page = 1">
              Mentions
            </div>
            <div class="btn btn-xs btn-secondary btn-outline" @click="page = 2">
              Sources
            </div>
            <div class="btn btn-xs btn-secondary btn-outline" @click="page = 3">
              Topic
            </div>
          </div>
        </div>
      </v-window-item>
      <v-window-item :value="1">
        <div class="text-xs breadcrumbs p-0">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Mentions</li>
          </ul>
        </div>
      </v-window-item>
      <v-window-item :value="2">
        <div class="text-xs breadcrumbs p-0">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Sources</li>
          </ul>
        </div>
      </v-window-item>
      <v-window-item :value="3">
        <div class="text-xs breadcrumbs p-0">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Topic</li>
          </ul>
        </div>
      </v-window-item>
    </v-window>
  </v-footer>
</template>

<script lang="ts">
import { useVideoSelection } from "@/stores/selection";

export default defineComponent({
  name: "SelectionControl",
  props: {},
  setup() {
    const selection = useVideoSelection();

    return { selection };
  },
  data() {
    return {
      page: 0,
    };
  },
  computed: {},
  methods: {
    exit() {
      this.selection.selectedVideos = [];
      this.selection.selectionMode = false;
      this.page = 0;
    },
  },
});
</script>

<style>
/**.bottom-nav {
  padding-bottom: min(max(calc(env(safe-area-inset-bottom)), 2px), 10px);
}
.bottom-nav > .nav-btn {
  padding-top: 0.4rem !important;
  padding-bottom: 0.2rem !important;
}*/

#selectionFooter {
  --btn-text-case: "unset";
}
</style>
