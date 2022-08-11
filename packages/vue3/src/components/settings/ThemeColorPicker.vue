<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <button
        id="picker"
        class="h-20 btn"
        v-bind="props"
        :class="'btn-' + daisyName"
        :style="{ 'background-color': color, color: foreground }"
      >
        {{ daisyName }}
        <span class="ml-auto mr-auto text-xs font-light">{{ color }}</span>
      </button>
    </template>
    {{ theme.colors?.[daisyName] }}
    <v-color-picker
      :model-value="theme.colors?.[daisyName]"
      mode="hex"
      hide-inputs
      @update:model-value="(v) => theme.setCustomTheme(daisyName, v)"
    ></v-color-picker>
  </v-menu>
</template>
<script lang="ts">
import { generateForegorundColorFrom } from "@/hooks/theme-changer/daisy-utils/daisy-color-fns";
import { DaisyColorName } from "@/hooks/theme-changer/daisy-utils/daisy-types";
import { presets } from "@/hooks/theme-changer/presets";
import { useThemeStore } from "@/stores";
import { PropType } from "vue";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "ThemeColorPicker",
  props: {
    daisyName: { type: String as PropType<DaisyColorName>, required: true },
    shorthand: {
      type: String,
      required: true,
    },
  },
  setup() {
    const theme = useThemeStore();
    return { theme };
  },
  data() {
    return { c2: this.theme.colors?.[this.daisyName] };
  },
  computed: {
    color() {
      return (
        this.theme.colors?.[this.daisyName] ||
        "hsl(" + this.theme.outputCache[1]?.[this.shorthand] + ")"
      );
    },
    foreground() {
      return "hsl(" + generateForegorundColorFrom(this.color) + ")";
    },
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
#picker {
  @apply border-4 border-white rounded-lg;
  border-style: solid;
  outline: 4px solid black;
}
</style>
