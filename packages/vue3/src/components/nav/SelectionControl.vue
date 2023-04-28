<template>
  <footer
    v-if="selection.selectionMode"
    id="selectionFooter"
    class="flex w-full bg-bgColor-600 px-4 py-2"
  >
    <div
      class="btn-secondary btn-xs btn self-start transition-[width]"
      :class="{
        'md:w-16': selection.selectedVideos.length === 0,
        'btn-square': selection.selectedVideos.length,
      }"
    >
      <h-icon class="i-mdi:close-circle" @click="exit" />
    </div>

    <div class="carousel-vertical carousel">
      <div v-if="page == 0" class="carousel-item h-full">
        <div class="flex flex-row flex-wrap gap-2">
          <h-btn
            v-show="selection.selectedVideos.length > 0"
            class="btn-outline btn-primary btn-xs"
            @click="selection.selectedVideos = []"
          >
            <div class="i-material-symbols:deselect -ml-1 mr-1 text-lg" />
            Deselect
          </h-btn>

          <h-btn
            v-show="selection.selectedVideos.length > 0"
            class="btn-outline btn-primary btn-xs"
            @click="showVideos = true"
          >
            <div class="i-mdi:select-search -ml-1 mr-1 text-lg" />
            Show {{ selection.selectedVideos.length }} Videos
          </h-btn>
          <h-dialog v-model="showVideos" :persistent="false">
            <h-card class="h-[80vh] p-4">
              <video-card-virtual-list
                class="w-full p-2"
                :videos="selection.selectedVideos"
              />
            </h-card>
          </h-dialog>

          <h-btn
            class="btn-xs"
            :class="
              !selection.selectedVideos.length
                ? 'btn-disabled'
                : 'btn-secondary'
            "
          >
            Open in Multiview
          </h-btn>

          <h-menu>
            <template #activator="{ props }">
              <h-btn
                class="btn-xs btn"
                no-color
                :class="
                  !selection.selectedVideos.length
                    ? 'btn-disabled'
                    : 'btn-secondary'
                "
                v-bind="props"
              >
                <div
                  class="i-material-symbols:list-alt-outline -ml-1 mr-1 text-lg"
                />
                <span class="mx-1">Playlist</span>
                <div class="i-bx:chevron-up" />
              </h-btn>
            </template>
            <div
              class="menu-group btn-group btn-group-vertical min-w-full self-start"
            >
              <div
                class="btn-secondary btn-xs btn bg-bgColor-400"
                @click="page = 1"
              >
                Add to current Playlist
              </div>
              <div
                class="btn-secondary btn-xs btn bg-bgColor-400"
                @click="page = 2"
              >
                Make into new Playlist
              </div>
            </div>
          </h-menu>

          <h-menu>
            <template #activator="{ props }">
              <h-btn
                class="btn-xs btn"
                no-color
                :class="
                  selection.selectedVideos.length === 0
                    ? 'btn-disabled'
                    : 'btn-secondary'
                "
                v-bind="props"
              >
                <div class="i-fluent:group-20-regular -ml-1 mr-1 text-lg" />
                <span class="mx-1">Modify Attributes</span>
                <div class="i-bx:chevron-up" />
              </h-btn>
            </template>
            <div
              class="menu-group btn-group btn-group-vertical min-w-full self-start"
            >
              <div
                class="btn-outline btn-secondary btn-xs btn bg-bgColor-400"
                @click="page = 1"
              >
                Mentions
              </div>
              <div
                class="btn-outline btn-secondary btn-xs btn bg-bgColor-400"
                @click="page = 2"
              >
                Sources
              </div>
              <div
                class="btn-outline btn-secondary btn-xs btn bg-bgColor-400"
                @click="page = 3"
              >
                Topic
              </div>
              <div class="btn-outline btn-secondary btn-xs btn bg-bgColor-400">
                Language (clips only)
              </div>
            </div>
          </h-menu>

          <h-menu>
            <template #activator="{ props }">
              <h-btn
                class="btn-outline btn-xs btn"
                no-color
                :class="
                  !selection.selectedVideos.length
                    ? 'btn-disabled'
                    : 'btn-secondary'
                "
                v-bind="props"
              >
                <div class="i-fluent:connected-20-filled -ml-1 mr-1 text-lg" />
                <span class="mx-1">Intelligent Multi-Edit</span>
                <div class="i-bx:chevron-up" />
              </h-btn>
            </template>
            <div class="menu-group btn-group btn-group-vertical self-start">
              <div
                v-if="
                  !selection.selectedVideos.find(
                    (x) => x.type == 'clip' || x.type == 'placeholder'
                  ) && selection.selectedVideos.length > 1
                "
                class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
              >
                Make Simulwatch/Collab
              </div>
              <div
                v-if="selection.context.pageVideo"
                class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
              >
                Disassociate w/ Current Video
              </div>
              <div
                v-if="selection.context.pageChannel"
                class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
              >
                Disassociate w/ Current Channel
              </div>
              <div
                v-if="selection.selectedVideos.find((x) => x.type == 'clip')"
                class="peer btn-outline btn-secondary btn-xs btn bg-bgColor-400"
              >
                Hide Selected Clips
              </div>
              <div
                class="btn-outline btn-outline btn-disabled btn-secondary btn-secondary btn-xs btn-xs btn hidden max-w-xs bg-bgColor-400 first:block"
              >
                No options available for selected videos.
              </div>
            </div>
          </h-menu>
        </div>
      </div>
      <div v-if="page == 1" class="carousel-item h-full">
        <div class="breadcrumbs items-center p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Mentions</li>
          </ul>
        </div>
      </div>
      <div v-if="page == 2" class="carousel-item h-full">
        <div class="breadcrumbs items-center p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Sources</li>
          </ul>
        </div>
      </div>
      <div v-if="page == 3" class="carousel-item h-full">
        <div class="breadcrumbs items-center p-0 text-xs">
          <ul>
            <li @click="page = 0">
              <a>Selection ({{ selection.selectedVideos.length }})</a>
            </li>
            <li>Topic</li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { useVideoSelection } from "@/stores/selection";

export default defineComponent({
  name: "SelectionControl",
  setup() {
    const selection = useVideoSelection();
    const showVideos = ref(false);
    watch(
      () => selection.selectedVideos.length,
      (v) => {
        if (v === 0) {
          showVideos.value = false;
        }
      }
    );
    return { selection, showVideos };
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

.carousel-item {
  @apply outline outline-dashed outline-primary;
}
</style>
