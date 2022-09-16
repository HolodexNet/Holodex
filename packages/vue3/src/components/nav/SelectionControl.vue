<template>
  <v-footer id="selectionFooter" app class="flex flex-row gap-2">
    <div class="btn-group">
      <div class="btn btn-xs btn-ghost btn-secondary" disabled aria-disabled>
        <span class="text-xs font-normal"
          >Selected <span class="text-primary">12</span> videos</span
        >
      </div>

      <div class="btn btn-xs btn-secondary btn-outline">Open in Multiview</div>
      <div class="btn btn-xs btn-secondary btn-outline">
        Add to current Playlist
      </div>
      <div class="btn btn-xs btn-secondary btn-outline">
        Make into new Playlist
      </div>
    </div>
    <div class="btn-group">
      <div
        class="btn btn-xs btn-ghost btn-secondary font-normal"
        disabled
        aria-disabled
      >
        Group Edit:
      </div>
      <div class="btn btn-xs btn-secondary btn-outline">Mentions</div>
      <div class="btn btn-xs btn-secondary btn-outline">Sources</div>
      <div class="btn btn-xs btn-secondary btn-outline">Topic</div>
    </div>
  </v-footer>
</template>

<script lang="ts">
export default {
  name: "SelectionControl",
  props: {},
  data() {
    return {
      value: "/",
    };
  },
  computed: {},
  methods: {},
};
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
