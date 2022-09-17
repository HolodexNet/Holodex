<template>
  <v-footer v-if="selection.selectionMode" id="selectionFooter" app>
    <div
      class="self-start mr-2 transition-all btn btn-xs btn-secondary"
      :class="{
        'md:w-16': selection.selectedVideos.length === 0,
        'btn-square': selection.selectedVideos.length,
      }"
    >
      <div class="i-mdi:close-circle" @click="exit"></div>
    </div>

    <v-window v-model="page" direction="vertical">
      <v-window-item :value="0">
        <div class="flex flex-row flex-wrap gap-2">
          <div
            class="self-start btn-group btn-group-vertical sm:btn-group-horizontal"
          >
            <div
              class="cursor-default pointer-events-auto btn btn-xs btn-ghost btn-secondary btn-disabled"
            >
              <span class="text-xs font-normal text-primary-300">
                Selected
                <span class="text-primary">{{
                  selection.selectedVideos.length
                }}</span>
                videos
              </span>
            </div>
            <div
              v-show="selection.selectedVideos.length > 0"
              class="btn btn-xs btn-outline btn-primary"
              @click="selection.selectedVideos = []"
            >
              <div class="i-material-symbols:deselect"></div>
            </div>

            <div
              class="btn btn-xs btn-outline"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'bg-bgColor-400 btn-secondary'
              "
            >
              Open in Multiview
            </div>
            <div
              class="btn btn-xs btn-outline"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'bg-bgColor-400 btn-secondary'
              "
            >
              Add to current Playlist
            </div>
            <div
              class="btn btn-xs btn-outline"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'bg-bgColor-400 btn-secondary'
              "
            >
              Make into new Playlist
            </div>
          </div>
          <div
            class="btn btn-xs btn-outline"
            :class="
              !selection.selectedVideos.length
                ? 'btn-disabled'
                : 'bg-bgColor-400 btn-secondary'
            "
          >
            <div class="text-lg i-fluent:group-20-regular"></div>
            <span class="mx-1">Modify Attributes</span>
            <div class="i-bx:chevron-up"></div>

            <v-menu activator="parent">
              <div
                class="self-start min-w-full btn-group btn-group-vertical menu-group"
              >
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                  @click="page = 1"
                >
                  Mentions
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                  @click="page = 2"
                >
                  Sources
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                  @click="page = 3"
                >
                  Topic
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                >
                  Language (clips only)
                </div>
              </div>
            </v-menu>
          </div>

          <div
            class="btn btn-xs btn-outline"
            :class="
              !selection.selectedVideos.length
                ? 'btn-disabled'
                : 'bg-bgColor-400 btn-secondary'
            "
          >
            <div class="text-lg i-fluent:connected-20-filled"></div>
            <span class="mx-1">Intelligent Multi-Edit</span>
            <div class="i-bx:chevron-up"></div>

            <v-menu activator="parent">
              <div class="self-start btn-group btn-group-vertical menu-group">
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                >
                  Make Simulwatch/Collab
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                >
                  Disassociate w/ Current Video (Watch Page only)
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                >
                  Disassociate w/ Current Channel (Channel Page only)
                </div>
                <div
                  class="btn btn-xs btn-secondary btn-outline bg-bgColor-400"
                >
                  Hide Selected Videos (Clips only)
                </div>
              </div>
            </v-menu>
          </div>
        </div>
      </v-window-item>
      <v-window-item :value="1">
        <div class="p-0 text-xs breadcrumbs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Mentions</li>
          </ul>
        </div>
      </v-window-item>
      <v-window-item :value="2">
        <div class="p-0 text-xs breadcrumbs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Sources</li>
          </ul>
        </div>
      </v-window-item>
      <v-window-item :value="3">
        <div class="p-0 text-xs breadcrumbs">
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

.menu-group {
  --btn-text-case: "unset";
}
#selectionFooter {
  --btn-text-case: "unset";
  /*background: hsl(var(--b1-50)) !important;*/
  padding-left: 0.5rem;

  border-top: 2px solid hsl(var(--p));
}
</style>
