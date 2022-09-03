<template>
  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.languageSettings") }}
  </div>
  <v-select
    v-model="langStore.lang"
    :items="langs"
    item-value="val"
    class="max-w-sm menu"
    variant="outlined"
    :hint="'» ' + langs.find((x) => x.val === langStore.lang)?.credit"
    persistent-hint
  >
    <template #item="{ item, props }">
      <!-- {{item}} -->
      <div class="p-1" v-bind="props">
        <span class="text-primary" style="">{{
          (item as any).raw.display
        }}</span>
        <span class="px-2 text-sm text-secondary">
          ♡ {{ (item as any).raw.credit }}</span
        >
      </div>
    </template>
    <template #selection="{ item }">
      <span class="primary--text" style="">{{
        (item as any).raw.display
      }}</span>
    </template>
  </v-select>
  <div class="divider" />

  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.useEnglishNameLabel") }}
  </div>
  <div class="max-w-sm form-control lang-settings">
    <label class="cursor-pointer label">
      <span class="label-text">{{
        $t("views.settings.useEnglishNameMsg")
      }}</span>
      <input
        v-model="langStore.useEnglishName"
        type="checkbox"
        class="toggle toggle-primary"
      />
    </label>
  </div>

  <div class="divider" />
  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.clipLanguageSelection") }}
  </div>
  <!-- <v-container fluid> -->
  <div class="max-w-sm form-control lang-settings">
    <label
      v-for="l in TL_LANGS"
      :key="l.value + 'settchkbx'"
      class="cursor-pointer label"
    >
      <span class="label-text">{{ l.text }}</span>
      <input
        v-model="langStore.clipLangs"
        type="checkbox"
        :value="l.value"
        class="checkbox checkbox-primary"
      />
    </label>
  </div>
  <!-- </v-container> -->

  <!-- <v-hover v-if="overrideLanguage" v-slot="{ hover }">
        <v-alert
          v-ripple
          dense
          block
          prominent
          :text="!hover"
          color="orange accent-3"
          elevation="10"
          class="mt-3 mb-1"
          :icon="mdiGestureTap"
          style="cursor: pointer"
          @click="overrideLanguage = undefined"
        >
          Language is being overridden to
          <code>{{
            langs.find((x) => x.val === overrideLanguage)?.display
          }}</code
          >, click here to reset.
        </v-alert>
      </v-hover> -->
</template>
<script lang="ts">
import { mdiFilterOutline, mdiEarth } from "@mdi/js";
import { TL_LANGS } from "@/utils/consts";
import { langs } from "@/hooks/i18n/i18nConsts";
import { useLangStore, useSiteStore } from "@/stores";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "LanguageSettings",
  setup() {
    const langStore = useLangStore();
    const siteStore = useSiteStore();

    return { langStore, siteStore };
  },
  data() {
    return {
      langs,
      mdiFilterOutline,
      mdiEarth,
      TL_LANGS,
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
.lang-settings .checkbox,
.lang-settings .toggle {
  /*border-width: 2px !important;*/
  /*background-color: rgba(var(--v-theme-primary), 0.1);*/
  /*outline: 1px solid rgba(var(--v-theme-primary), 0.6);*/
  border-style: solid;
}
.lang-settings label.label {
  padding-left: 2em;
}
.lang-settings label.label:nth-child(even) {
  @apply bg-bgColor-500 rounded;
}
</style>
