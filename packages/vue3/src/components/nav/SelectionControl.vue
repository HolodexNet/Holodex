<template>
  <footer
    v-if="selection.selectionMode"
    id="selectionFooter"
    class="flex w-full bg-bgColor-600 px-4 py-2"
  >
    <div
      class="btn btn-secondary btn-xs mr-2 self-start transition-all"
      :class="{
        'md:w-16': selection.selectedVideos.length === 0,
        'btn-square': selection.selectedVideos.length,
      }"
    >
      <h-icon class="i-mdi:close-circle" @click="exit" />
    </div>

    <div class="carousel-vertical carousel h-9">
      <div v-if="page == 0" class="carousel-item h-full">
        <div class="flex flex-row flex-wrap gap-2">
          <h-btn
            v-show="selection.selectedVideos.length > 0"
            class="btn-outline btn btn-primary btn-xs"
            icon="i-material-symbols:deselect"
            @click="selection.selectedVideos = []"
          >
            <span class="text-xs font-normal text-primary-300">
              Deselect
              <span class="text-primary">
                {{ selection.selectedVideos.length }}
              </span>
              videos
            </span>
          </h-btn>

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

          <h-menu>
            <template #activator="{ props }">
              <h-btn
                class="btn btn-xs"
                :class="
                  !selection.selectedVideos.length
                    ? 'btn-disabled'
                    : 'btn-secondary bg-bgColor-400'
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
                class="btn btn-secondary btn-xs bg-bgColor-400"
                @click="page = 1"
              >
                Add to current Playlist
              </div>
              <div
                class="btn btn-secondary btn-xs bg-bgColor-400"
                @click="page = 2"
              >
                Make into new Playlist
              </div>
            </div>
          </h-menu>

          <h-menu>
            <template #activator="{ props }">
              <h-btn
                class="btn btn-xs"
                :class="
                  !selection.selectedVideos.length
                    ? 'btn-disabled'
                    : 'btn-secondary bg-bgColor-400'
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
              <div class="btn-outline btn btn-secondary btn-xs bg-bgColor-400">
                Language (clips only)
              </div>
            </div>
          </h-menu>

          <h-menu>
            <template #activator="{ props }">
              <button
                class="btn-outline btn btn-xs"
                :class="
                  !selection.selectedVideos.length
                    ? 'btn-disabled'
                    : 'btn-secondary bg-bgColor-400'
                "
                v-bind="props"
              >
                <div class="i-fluent:connected-20-filled mr-1 -ml-1 text-lg" />
                <span class="mx-1">Intelligent Multi-Edit</span>
                <div class="i-bx:chevron-up" />
              </button>
            </template>
            <div class="menu-group btn-group btn-group-vertical self-start">
              <div
                v-if="
                  !selection.selectedVideos.find(
                    (x) => x.type == 'clip' || x.type == 'placeholder'
                  )
                "
                class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
              >
                Make Simulwatch/Collab
              </div>
              <div
                v-if="selection.context.pageVideo"
                class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
              >
                Disassociate w/ Current Video
              </div>
              <div
                v-if="selection.context.pageChannel"
                class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
              >
                Disassociate w/ Current Channel
              </div>
              <div
                v-if="selection.selectedVideos.find((x) => x.type == 'clip')"
                class="btn-outline btn btn-secondary btn-xs bg-bgColor-400"
              >
                Hide Selected Clips
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

.carousel-item {
  @apply outline outline-dashed outline-primary;
}
</style>
