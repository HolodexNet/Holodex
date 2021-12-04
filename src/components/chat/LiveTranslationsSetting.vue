<template>
  <v-dialog v-model="dialog" width="500">
    <template #activator="{ on, attrs }">
      <v-btn
        icon
        x-small
        v-bind="attrs"
        :title="$t('views.watch.chat.TLSettingsTitle')"
        v-on="on"
      >
        <v-icon>
          {{ icons.mdiCog }}
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <template v-if="showBlockedList">
          <v-btn icon @click="showBlockedList = false">
            <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
          </v-btn>
          {{ $t("views.channels.tabs.Blocked") }}
        </template>
        <template v-else>
          {{ $t("views.watch.chat.TLSettingsTitle") }}
        </template>
      </v-card-title>

      <v-card-text>
        <template v-if="!showBlockedList">
          <v-select
            v-model="liveTlLang"
            :items="TL_LANGS"
            :hint="$t('views.settings.tlLanguageSelection')"
            persistent-hint
          />
          <v-switch
            v-model="liveTlShowVerified"
            :label="$t('views.watch.chat.showVerifiedMessages')"
            hide-details
          />
          <v-switch v-model="liveTlShowModerator" :label="$t('views.watch.chat.showModeratorMessages')" hide-details />
          <v-switch v-model="liveTlShowVtuber" :label="$t('views.watch.chat.showVtuberMessages')" hide-details />
          <v-switch v-model="liveTlShowLocalTime" :label="$t('views.watch.chat.showLocalTime')" hide-details />
          <v-switch
            v-model="liveTlShowSubtitle"
            :label="$t('views.watch.chat.showSubtitle')"
            hide-details
          />
          <v-switch
            v-model="liveTlStickBottom"
            class="mb-1"
            :label="$t('views.watch.chat.StickBottomSettingLabel')"
            :messages="$t('views.watch.chat.StickBottomSettingsDesc')"
          />
          <v-btn @click="showBlockedList = true">
            Edit Blocked List
          </v-btn>
          <v-divider class="my-6" />
          <v-combobox
            v-model="liveTlFontSize"
            :items="[10, 11, 12, 14, 18, 24, 30]"
            :label="$t('views.watch.chat.tlFontSize')"
            outlined
          >
            <template #append-outer>
              px
            </template>
          </v-combobox>
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
        </template>
        <template v-else>
          <v-list style="max-height: 300px; overflow: auto">
            <v-list-item v-for="name in blockedNames.values()" :key="name">
              <v-list-item-content class="text-body-1">
                {{ name }}
              </v-list-item-content>
              <v-list-item-action>
                <v-btn @click="toggleBlockName(name)">
                  Unblock
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { syncState } from "@/utils/functions";
import { TL_LANGS } from "@/utils/consts";

export default {
    name: "LiveTranslationsSettings",
    data() {
        return {
            showBlockedList: false,
            dialog: false,
            TL_LANGS,
        };
    },
    computed: {
        ...syncState("settings", [
            "liveTlStickBottom",
            "liveTlLang",
            "liveTlFontSize",
            "liveTlShowVerified",
            "liveTlShowModerator",
            "liveTlWindowSize",
            "liveTlShowLocalTime",
            "liveTlShowVtuber",
            "liveTlShowSubtitle",
        ]),
        blockedNames() {
            return this.$store.getters["settings/liveTlBlockedNames"];
        },
    },
    watch: {
        dialog(nw) {
            // unshow blocked list when exiting dialog
            if (!nw) {
                this.showBlockedList = false;
            }
        },
    },
    methods: {
        toggleBlockName(name) {
            this.$store.commit("settings/toggleLiveTlBlocked", name);
        },
    },
};
</script>

<style></style>
