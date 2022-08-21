<template>
  <div class="mb-2 text-lg font-semibold">Default Homepage:</div>
  <div class="max-w-sm form-control">
    <label class="cursor-pointer label">
      <span class="label-text"> Last Visited Org Home </span>
      <input
        type="radio"
        name="radio-6"
        class="radio checked:bg-red-500"
        checked
      />
    </label>
    <label class="cursor-pointer label">
      <span class="label-text"> Favorites (When Logged In) </span>
      <input
        type="radio"
        name="radio-6"
        class="radio checked:bg-red-500"
        checked
      />
    </label>
  </div>

  <div class="divider" />

  <div class="mb-2 text-lg font-semibold">Grid Size:</div>

  <div class="btn-group">
    <button
      class="btn"
      :class="{ 'btn-active': settings.gridDensity === 0 }"
      @click="settings.gridDensity = 0"
    >
      Comfortable
    </button>
    <button
      class="btn"
      :class="{ 'btn-active': settings.gridDensity === 1 }"
      @click="settings.gridDensity = 1"
    >
      Normal
    </button>
    <button
      class="btn"
      :class="{ 'btn-active': settings.gridDensity === 2 }"
      @click="settings.gridDensity = 2"
    >
      Dense
    </button>
  </div>
  <div class="divider" />

  <div class="mb-2 text-lg font-semibold">
    Ignored Topics
    <!-- {{ $t("views.settings.languageSettings") }} -->
  </div>
  <v-select
    :items="[]"
    item-value="name"
    item-title="name"
    class="max-w-sm menu"
    variant="outlined"
    hide-details
  >
    <template #item="{ item, props }">
      <!-- {{item}} -->
      <div class="p-1 px-2" v-bind="props">
        <span :style="{ color: item.raw.colors.primary }">{{
          (item as any).raw.name
        }}</span>
      </div>
    </template>
    <template #selection="{ item }">
      <span class="text-primary" style="">{{ (item as any).raw.name }}</span>
    </template>
  </v-select>
  <div class="divider" />
  <div class="divider" />

  <div class="mb-2 text-lg font-semibold">Hide Features:</div>
  <div class="max-w-sm form-control">
    <label class="cursor-pointer label">
      <span class="label-text"> Hide Video Thumbnails </span>
      <input
        v-model="settings.hideThumbnail"
        type="checkbox"
        class="toggle toggle-primary"
      />
    </label>
    <label class="cursor-pointer label">
      <span class="label-text"> Hide Collab Streams </span>
      <input
        v-model="settings.hideCollabStreams"
        type="checkbox"
        class="toggle toggle-primary"
      />
    </label>
    <label class="cursor-pointer label">
      <span class="label-text"> Hide Placeholder Streams </span>
      <input
        v-model="settings.hidePlaceholder"
        type="checkbox"
        class="toggle toggle-primary"
      />
    </label>
  </div>
</template>
<script lang="ts">
import { useSiteStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "HomepageFilters",
  setup() {
    const siteStore = useSiteStore();
    const settings = useSettingsStore();
    return { siteStore, settings };
  },
  data() {
    return {};
  },
  computed: {
    // overrideLanguage: {
    //   get() {
    //     return this.$route.query.lang;
    //   },
    //   set(v) {
    //     this.$route.query.lang = v;
    //     const r = this.$router.resolve({
    //       name: this.$route.name, // put your route information in
    //       params: this.$route.params, // put your route information in
    //       query: this.$route.query, // put your route information in
    //       hash: this.$route.hash,
    //     });
    //     window.location.assign(r.href);
    //   },
    // },
  },
  watch: {},
  methods: {},
});
</script>
<style>
.checkbox,
.radio,
.toggle {
  /*border-width: 2px !important;*/
  /*background-color: rgba(var(--v-theme-primary), 0.1);*/
  /*outline: 1px solid rgba(var(--v-theme-primary), 0.6);*/
  border-style: solid;
}
label.label {
  padding-left: 2em;
}
label.label:nth-child(even) {
  @apply bg-base-200 rounded;
}
</style>
