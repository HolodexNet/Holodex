<template>
  <div class="mb-2 text-lg font-semibold">
    Preset Themes
    <!-- {{ $t("views.settings.languageSettings") }} -->
  </div>
  <h-select
    :model-value="theme.name"
    :items="presets"
    item-value="name"
    item-title="name"
    class="menu max-w-sm"
    variant="outlined"
    hide-details
    @update:model-value="(e) => theme.setTheme(e)"
  >
    <!--     :hint="'» ' + langs.find((x) => x.val === langStore.lang)?.credit"
    persistent-hint
 -->
    <template #item="{ item, props }">
      <!-- {{item}} -->
      <div class="p-1 px-2" v-bind="props">
        <span :style="{ color: item.raw.colors.primary }">
          {{ (item as any).raw.name }}
        </span>
      </div>
    </template>
    <template #selection="{ item }">
      <span class="text-primary" style="">{{ (item as any).raw.name }}</span>
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

  <div style="display: none">
    <div
      class="btn-neutral btn-primary btn-secondary btn-accent btn-info btn-success btn-warning btn-error"
    />
    <!-- this is just to trick daisy into importing every single color space -->
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
      'grid-template-columns': 'repeat(auto-fill, minmax(250px, 1fr))',
    }"
  >
    <div class="btn-group">
      <div class="btn btn-xs bg-primary-700">700</div>
      <div class="btn btn-xs bg-primary-600" />
      <div class="btn btn-xs bg-primary-500" />
      <div class="btn btn-xs bg-primary" />
      <div class="btn btn-xs bg-primary-300" />
      <div class="btn btn-xs bg-primary-200" />
      <div class="btn btn-xs bg-primary-100">100</div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-secondary-700">700</div>
      <div class="btn btn-xs bg-secondary-600" />
      <div class="btn btn-xs bg-secondary-500" />
      <div class="btn btn-xs bg-secondary" />
      <div class="btn btn-xs bg-secondary-300" />
      <div class="btn btn-xs bg-secondary-200" />
      <div class="btn btn-xs bg-secondary-100">100</div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-accent-700">700</div>
      <div class="btn btn-xs bg-accent-600" />
      <div class="btn btn-xs bg-accent-500" />
      <div class="btn btn-xs bg-accent" />
      <div class="btn btn-xs bg-accent-300" />
      <div class="btn btn-xs bg-accent-200" />
      <div class="btn btn-xs bg-accent-100">100</div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-bgColor-700">700</div>
      <div class="btn btn-xs bg-bgColor-600" />
      <div class="btn btn-xs bg-bgColor-500" />
      <div class="btn btn-xs bg-bgColor-400" />
      <div class="btn btn-xs bg-bgColor-300" />
      <div class="btn btn-xs bg-bgColor-200" />
      <div class="btn btn-xs bg-bgColor-100">100</div>
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
</style>
