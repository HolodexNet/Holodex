<template>
  <v-footer v-if="selection.selectionMode" id="selectionFooter" app>
    <div
      class="btn btn-secondary btn-xs mr-2 self-start transition-all"
      :class="{
        'md:w-16': selection.selectedVideos.length === 0,
        'btn-square': selection.selectedVideos.length,
      }"
    >
      <div class="i-mdi:close-circle" @click="exit"></div>
    </div>

    <div class="carousel-vertical carousel h-9">
      <div v-if="page == 0" class="carousel-item h-full">
        <div class="flex flex-row flex-wrap gap-2">
          <div class="btn-group self-start">
            <div
              class="btn-disabled btn btn-secondary btn-ghost btn-xs pointer-events-auto cursor-default"
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
              class="btn-outline btn btn-primary btn-xs"
              @click="selection.selectedVideos = []"
            >
              <div class="i-material-symbols:deselect"></div>
            </div>

            <div
              class="btn-outline btn btn-xs"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'btn-secondary bg-bgColor-400'
              "
            >
              Open in Multiview
            </div>
            <div
              class="btn-outline btn btn-xs"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'btn-secondary bg-bgColor-400'
              "
            >
              Add to current Playlist
            </div>
            <div
              class="btn-outline btn btn-xs"
              :class="
                !selection.selectedVideos.length
                  ? 'btn-disabled'
                  : 'btn-secondary bg-bgColor-400'
              "
            >
              Make into new Playlist
            </div>
          </div>
          <div
            class="btn-outline btn btn-xs"
            :class="
              !selection.selectedVideos.length
                ? 'btn-disabled'
                : 'btn-secondary bg-bgColor-400'
            "
          >
            <div class="i-fluent:group-20-regular text-lg"></div>
            <span class="mx-1">Modify Attributes</span>
            <div class="i-bx:chevron-up"></div>

            <v-menu activator="parent">
              <div
                class="menu-group btn-group btn-group-vertical min-w-full self-start"
              >
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                  @click="page = 1"
                >
                  Mentions
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                  @click="page = 2"
                >
                  Sources
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                  @click="page = 3"
                >
                  Topic
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                >
                  Language (clips only)
                </div>
              </div>
            </v-menu>
          </div>

          <div
            class="btn-outline btn btn-xs"
            :class="
              !selection.selectedVideos.length
                ? 'btn-disabled'
                : 'btn-secondary bg-bgColor-400'
            "
          >
            <div class="i-fluent:connected-20-filled text-lg"></div>
            <span class="mx-1">Intelligent Multi-Edit</span>
            <div class="i-bx:chevron-up"></div>

            <v-menu activator="parent">
              <div class="menu-group btn-group btn-group-vertical self-start">
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                >
                  Make Simulwatch/Collab
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                >
                  Disassociate w/ Current Video (Watch Page only)
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                >
                  Disassociate w/ Current Channel (Channel Page only)
                </div>
                <div
                  class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
                >
                  Hide Selected Videos (Clips only)
                </div>
              </div>
            </v-menu>
          </div>
        </div>
      </div>
      <div v-if="page == 1" class="carousel-item h-full">
        <div class="breadcrumbs p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Mentions</li>
          </ul>
        </div>
      </div>
      <div v-if="page == 2" class="carousel-item h-full">
        <div class="breadcrumbs p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Sources</li>
          </ul>
        </div>
      </div>
      <div v-if="page == 3" class="carousel-item h-full">
        <div class="breadcrumbs p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Topic</li>
          </ul>
        </div>
      </div>
    </div>
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
