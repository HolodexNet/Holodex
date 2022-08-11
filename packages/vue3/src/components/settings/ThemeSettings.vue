<template>
  <div class="mb-2 text-lg font-semibold">
    Preset Themes
    <!-- {{ $t("views.settings.languageSettings") }} -->
  </div>
  <v-select
    :model-value="theme.name"
    :items="presets"
    item-value="name"
    item-title="name"
    class="max-w-sm menu"
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

  <div class="mb-2 text-lg font-semibold">Dark Color Theme</div>
  <div class="max-w-sm form-control">
    <label class="cursor-pointer label">
      <span class="label-text"> Indicate if the color theme is dark. </span>
      <input
        v-model="theme.dark"
        type="checkbox"
        class="toggle toggle-primary"
      />
    </label>
  </div>

  <div class="divider" />
  <div class="mb-2 text-lg font-semibold">Advanced Color Customization</div>

  <div style="display: none">
    <div
      class="btn-primary btn-secondary btn-accent btn-neutral btn-info btn-success btn-warning btn-error"
    />
    <!-- this is just to trick daisy into importing every single color space -->
  </div>
  <div class="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4 lg:grid-cols-6">
    <theme-color-picker daisy-name="primary" shorthand="--p" />
    <theme-color-picker daisy-name="secondary" shorthand="--s" />
    <theme-color-picker daisy-name="accent" shorthand="--a" />
    <theme-color-picker daisy-name="neutral" shorthand="--su" />
    <theme-color-picker daisy-name="base-100" shorthand="--b1" />
    <theme-color-picker daisy-name="base-200" shorthand="--b2" />
    <theme-color-picker daisy-name="base-300" shorthand="--b3" />
    <theme-color-picker daisy-name="success" shorthand="--su" />
    <theme-color-picker daisy-name="info" shorthand="--er" />
    <theme-color-picker daisy-name="warning" shorthand="--su" />
    <theme-color-picker daisy-name="error" shorthand="--er" />
  </div>

  <div class="divider">
    <span>Test Color (for beta only):</span>
  </div>
  <div class="grid grid-cols-5 gap-2">
    <div class="btn-group">
      <div class="btn btn-xs bg-primary darken-3"></div>
      <div class="btn btn-xs bg-primary darken-2"></div>
      <div class="btn btn-xs bg-primary darken-1"></div>
      <div class="btn btn-xs bg-primary"></div>
      <div class="btn btn-xs bg-primary lighten-1"></div>
      <div class="btn btn-xs bg-primary lighten-2"></div>
      <div class="btn btn-xs bg-primary lighten-3"></div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-secondary darken-3"></div>
      <div class="btn btn-xs bg-secondary darken-2"></div>
      <div class="btn btn-xs bg-secondary darken-1"></div>
      <div class="btn btn-xs bg-secondary"></div>
      <div class="btn btn-xs bg-secondary lighten-1"></div>
      <div class="btn btn-xs bg-secondary lighten-2"></div>
      <div class="btn btn-xs bg-secondary lighten-3"></div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-accent darken-3"></div>
      <div class="btn btn-xs bg-accent darken-2"></div>
      <div class="btn btn-xs bg-accent darken-1"></div>
      <div class="btn btn-xs bg-accent"></div>
      <div class="btn btn-xs bg-accent lighten-1"></div>
      <div class="btn btn-xs bg-accent lighten-2"></div>
      <div class="btn btn-xs bg-accent lighten-3"></div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-background darken-3"></div>
      <div class="btn btn-xs bg-background darken-2"></div>
      <div class="btn btn-xs bg-background darken-1"></div>
      <div class="btn btn-xs bg-background"></div>
      <div class="btn btn-xs bg-background lighten-1"></div>
      <div class="btn btn-xs bg-background lighten-2"></div>
      <div class="btn btn-xs bg-background lighten-3"></div>
    </div>
    <div class="btn-group">
      <div class="btn btn-xs bg-surface darken-3"></div>
      <div class="btn btn-xs bg-surface darken-2"></div>
      <div class="btn btn-xs bg-surface darken-1"></div>
      <div class="btn btn-xs bg-surface"></div>
      <div class="btn btn-xs bg-surface lighten-1"></div>
      <div class="btn btn-xs bg-surface lighten-2"></div>
      <div class="btn btn-xs bg-surface lighten-3"></div>
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
  methods: {},
});
</script>
<style>
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
  @apply bg-base-300 rounded;
}
</style>
