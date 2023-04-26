<template>
  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.languageSettings") }}
  </div>
  <div class="lang-settings pl-8">
    <h-input
      :explanation="'» ' + langs.find((x) => x.val === langStore.lang)?.credit"
    >
      <template #input>
        <h-select
          :model-value="langs.find((x) => x.val === langStore.lang) || langs[0]"
          :items="langs"
          item-value="val"
          item-title="display"
          class="w-full max-w-sm"
          @update:model-value="
            (v) => {
              langStore.lang = v.val;
            }
          "
        >
          <template #item="{ item, selected }">
            <div class="p-1" :class="[selected && 'font-bold']">
              <span class="font-bold" style="">
                {{ (item as any).display }}
              </span>
              <span class="px-2 text-sm opacity-60">
                ♡ {{ (item as any).credit }}
              </span>
            </div>
          </template>
          <template #selection="{ item }">
            <span class="primary--text" style="">
              {{ (item as any).display }}
            </span>
          </template>
        </h-select>
      </template>
    </h-input>
  </div>
  <span class="external-link link-primary link px-8 text-sm">
    Help Translate Holodex!
  </span>
  <div class="divider" />

  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.useEnglishNameLabel") }}
  </div>
  <div class="lang-settings form-control max-w-sm">
    <label class="label cursor-pointer">
      <span class="label-text">
        {{ $t("views.settings.useEnglishNameMsg") }}
      </span>
      <input
        v-model="langStore.useEnglishName"
        type="checkbox"
        class="toggle-primary toggle"
      />
    </label>
  </div>

  <div class="divider" />
  <div class="mb-2 text-lg font-semibold">
    {{ $t("views.settings.clipLanguageSelection") }}
  </div>
  <!-- <v-container fluid> -->
  <div class="lang-settings form-control max-w-sm">
    <label
      v-for="l in TL_LANGS"
      :key="l.value + 'settchkbx'"
      class="label cursor-pointer"
    >
      <span class="label-text">{{ l.text }}</span>
      <input
        v-model="langStore.clipLangs"
        type="checkbox"
        :value="l.value"
        class="checkbox-primary checkbox"
      />
    </label>
  </div>
  <!-- </v-container> -->

  <!-- <v-hover v-if="overrideLanguage" v-slot="{ hover }">
        <h-alert
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
        </h-alert>
      </v-hover> -->
</template>
<script lang="ts">
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
  @apply rounded bg-bgColor-500;
}
</style>
