<template>
  <v-dialog width="500">
    <template #activator="{ on, attrs }">
      <v-btn
        icon
        x-small
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>
          {{ icons.mdiArrowSplitHorizontal }}
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        {{ $t("views.watch.chat.TLSettingsTitle") }}
      </v-card-title>

      <v-card-text>
        <v-combobox
          v-model="liveTlWindowSize"
          :items="[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
          :label="$t('views.watch.chat.tlWindowSize')"
          outlined
          hide-details
        >
          <template #append-outer>
            %
          </template>
        </v-combobox>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { syncState } from "@/utils/functions";

export default {
    name: "LiveTranslationsSettings",
    computed: {
        ...syncState("settings", [
            "liveTlWindowSize",
        ]),
    },
};
</script>

<style></style>
