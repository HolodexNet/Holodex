<template>
  <div class="mb-2 text-lg font-semibold">
    Preset Themes
    <!-- {{ $t("views.settings.languageSettings") }} -->
  </div>
  <h-select
    :model-value="presets.find((x) => x.name === theme.name)"
    :items="presets"
    item-value="name"
    item-title="name"
    class="max-w-sm"
    variant="outlined"
    placeholder="Select a predefined theme"
    hide-details
    @update:model-value="(e) => theme.setTheme(e.name)"
  >
    <!--     :hint="'» ' + langs.find((x) => x.val === langStore.lang)?.credit"
    persistent-hint
 -->
    <template #item="{ item, selected }">
      <!-- {{item}} -->
      <div class="p-1 px-2" :class="selected && 'font-bold'">
        <span :style="{ color: item?.colors.primary ?? '#fff' }">
          {{ (item as any)?.name || "CUSTOM COLOR" }}
        </span>
      </div>
    </template>
    <template #selection="{ item }">
      <span class="text-primary" style="">
        {{ (item as any)?.name || "CUSTOM COLOR" }}
      </span>
    </template>
  </h-select>
  <div class="divider" />

  <div class="divider" />
  <div class="mb-2 text-lg font-semibold">Advanced Color Customization</div>

  <div class="form-control max-w-sm">
    <label class="label cursor-pointer">
      <span class="label-text">
        <b>Dark Color Theme</b>
        : Indicate if the color theme is dark. Dark themes suit darker
        backgrounds.
      </span>
      <input
        type="checkbox"
        class="toggle-primary toggle"
        :checked="theme.dark"
        @input="flipDark"
      />
    </label>
  </div>

  <div
    class="grid gap-4"
    :style="{
      'grid-template-columns': 'repeat(auto-fill, minmax(200px, 1fr))',
    }"
  >
    <theme-color-picker daisy-name="primary" shorthand="--p" />
    <theme-color-picker daisy-name="secondary" shorthand="--s" />
    <theme-color-picker daisy-name="accent" shorthand="--a" />
    <theme-color-picker daisy-name="neutral" shorthand="--su" />
    <theme-color-picker
      daisy-name="base-100"
      shorthand="--b1"
      display-name="bg Color"
    />
    <!-- <theme-color-picker daisy-name="base-200" shorthand="--b2" />
    <theme-color-picker daisy-name="base-300" shorthand="--b3" />
    <theme-color-picker daisy-name="success" shorthand="--su" />
    <theme-color-picker daisy-name="info" shorthand="--in" />
    <theme-color-picker daisy-name="warning" shorthand="--wa" />
    <theme-color-picker daisy-name="error" shorthand="--er" /> -->
  </div>

  <div class="divider">
    <span>Test Color (for beta only):</span>
  </div>
  <div
    class="grid gap-2"
    :style="{
      'grid-template-columns': 'repeat(auto-fill, minmax(200px, 1fr))',
    }"
  >
    <div class="flex flex-row gap-1">
      <div class="demobox bg-primary-900" title="900" />
      <div class="demobox bg-primary-800" title="800" />
      <div class="demobox bg-primary-700" title="700" />
      <div class="demobox bg-primary-600" title="600" />
      <div class="demobox bg-primary-500" title="500" />
      <div class="demobox bg-primary !w-8" title="400 (default)" />
      <div class="demobox bg-primary-300" title="300" />
      <div class="demobox bg-primary-200" title="200" />
      <div class="demobox bg-primary-100" title="100" />
      <div class="demobox bg-primary-50" title="50" />
    </div>
    <div class="flex flex-row gap-1">
      <div class="demobox bg-secondary-900" title="900" />
      <div class="demobox bg-secondary-800" title="800" />
      <div class="demobox bg-secondary-700" title="700" />
      <div class="demobox bg-secondary-600" title="600" />
      <div class="demobox bg-secondary-500" title="500" />
      <div class="demobox bg-secondary !w-8" title="400 (default)" />
      <div class="demobox bg-secondary-300" title="300" />
      <div class="demobox bg-secondary-200" title="200" />
      <div class="demobox bg-secondary-100" title="100" />
      <div class="demobox bg-secondary-50" title="50" />
    </div>
    <div class="flex flex-row gap-1">
      <div class="demobox bg-accent-900" title="900" />
      <div class="demobox bg-accent-800" title="800" />
      <div class="demobox bg-accent-700" title="700" />
      <div class="demobox bg-accent-600" title="600" />
      <div class="demobox bg-accent-500" title="500" />
      <div class="demobox bg-accent !w-8" title="400 (default)" />
      <div class="demobox bg-accent-300" title="300" />
      <div class="demobox bg-accent-200" title="200" />
      <div class="demobox bg-accent-100" title="100" />
      <div class="demobox bg-accent-50" title="50" />
    </div>
    <div class="flex flex-row gap-1">
      <div class="demobox bg-neutral !w-full" title="400 (default)" />
    </div>
    <div class="flex flex-row gap-1">
      <div class="demobox bg-bgColor-900" title="900" />
      <div class="demobox bg-bgColor-800" title="800" />
      <div class="demobox bg-bgColor-700" title="700" />
      <div class="demobox bg-bgColor-600" title="600" />
      <div class="demobox bg-bgColor-500" title="500" />
      <div class="demobox bg-bgColor !w-8" title="400 (default)" />
      <div class="demobox bg-bgColor-300" title="300" />
      <div class="demobox bg-bgColor-200" title="200" />
      <div class="demobox bg-bgColor-100" title="100" />
      <div class="demobox bg-bgColor-50" title="50" />
    </div>
  </div>
</template>
<script lang="ts">
import { useLangStore, useSiteStore, useThemeStore } from "@/stores";
import { presets } from "@/hooks/theme-changer/presets";

const colors = [
  "primary",
  //   "primary-focus",
  //   "primary-content",
  "secondary",
  //   "secondary-focus",
  //   "secondary-content",
  "accent",
  //   "accent-focus",
  //   "accent-content",
  "neutral",
  //   "neutral-focus",
  //   "neutral-content",
  "base-100",
  "base-200",
  "base-300",
  //   "base-content",
  "info",
  //   "info-content",
  "success",
  //   "success-content",
  "warning",
  //   "warning-content",
  "error",
  //   "error-content",
];

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "ThemeSettings",
  setup() {
    const langStore = useLangStore();
    const siteStore = useSiteStore();
    const theme = useThemeStore();
    return { theme, langStore, siteStore };
  },
  data() {
    return {
      presets,
      colors,
      gradients: ["primary", "secondary", "accent", "neutral", "bgColor"],
    };
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
  methods: {
    flipDark(e: any) {
      this.theme.setCustomThemeDark(e.target.checked);
    },
  },
});
</script>
<style scoped>
.checkbox,
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
  @apply rounded bg-bgColor-500;
}

.demobox {
  @apply h-4 w-4 rounded border border-gray-500;
}
</style>
