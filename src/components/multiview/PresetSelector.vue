<template>
  <v-card v-if="!slim" style="min-height: 90vh">
    <v-card-title>{{ $t("views.multiview.presets") }}</v-card-title>
    <v-card-text>
      <v-tabs v-model="currentTab" class="mb-2">
        <v-tab>{{ $t("views.multiview.preset.desktop") }}</v-tab>
        <v-tab>{{ $t("views.multiview.preset.custom") }}</v-tab>
        <v-tab>{{ $t("views.multiview.preset.mobile") }}</v-tab>
      </v-tabs>
      <div v-if="currentTab === 0">
        <v-btn :color="editAutoLayout ? 'primary' : ''" @click="editAutoLayout = !editAutoLayout">
          <v-icon left>
            {{ editAutoLayout ? icons.mdiCheck : icons.mdiPencil }}
          </v-icon>
          {{ editAutoLayout ? $t("views.multiview.done") : $t("views.multiview.editAutoLayout") }}
        </v-btn>
        <v-btn
          v-if="editAutoLayout"
          color="orange"
          class="ml-1"
          @click="$store.commit('multiview/resetAutoLayout')"
        >
          <v-icon left>
            {{ icons.mdiRefresh }}
          </v-icon>
          {{ $t("views.library.selectionReset") }}
        </v-btn>
        <template v-for="(group, index) in desktopGroups">
          <v-radio-group
            :key="'preset-' + index"
            :value="autoLayout[index] || 'None'"
            column
            hide-details
            class="ma-0"
          >
            <v-card-subtitle v-if="index !== 0" class="text-body-1 pa-1">
              {{ $t("component.channelInfo.videoCount", [index]) }}
            </v-card-subtitle>
            <v-row v-if="group" :key="'desktop-' + index">
              <v-col v-if="editAutoLayout" cols="auto" class="pa-1">
                <LayoutPreviewCard
                  :preset="{ layout: '', content: {} }"
                >
                  <template #pre>
                    <v-radio
                      v-show="editAutoLayout"
                      label="None"
                      value="None"
                      class="ma-0"
                      @click="setAutoLayout(index, null)"
                    />
                  </template>
                </LayoutPreviewCard>
              </v-col>
              <template v-for="preset in group">
                <v-col :key="preset.name" cols="auto" class="pa-1">
                  <LayoutPreviewCard
                    v-if="!showCustom || (showCustom && preset.custom)"
                    :preset="preset"
                    :active="presetInAuto(preset)"
                    @click="editAutoLayout ? setAutoLayout(index, preset.id) : handleSelected(preset)"
                  >
                    <template #pre>
                      <v-radio
                        v-show="editAutoLayout"
                        label=""
                        :value="preset.id"
                        class="ma-0"
                      />
                    </template>
                    <template v-if="preset.custom" #post>
                      <v-menu bottom nudge-top="20px">
                        <template #activator="{ on }">
                          <v-icon style="position: absolute; right: 0;" v-on="on" @click.stop.prevent>
                            {{ icons.mdiDotsVertical }}
                          </v-icon>
                        </template>
                        <v-list dense>
                          <v-list-item @click.stop="removePresetLayout(preset)">
                            <v-icon left>
                              {{ icons.mdiDelete }}
                            </v-icon>
                            {{ $t("views.multiview.preset.remove") }}
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </LayoutPreviewCard>
                </v-col>
              </template>
            </v-row>
          </v-radio-group>
        </template>
      </div>
      <v-row v-else-if="currentTab === 1">
        <template v-for="preset in decodedCustomPresets">
          <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
            <LayoutPreviewCard
              :preset="preset"
              :active="presetInAuto(preset)"
              @click="handleSelected(preset)"
            />
          </v-col>
        </template>
      </v-row>
      <v-row v-else-if="currentTab === 2" justify="space-around" align="center">
        <template v-for="preset in decodedMobilePresets">
          <v-col :key="preset.name" cols="auto" class="d-flex flex-column align-center">
            <LayoutPreviewCard
              :preset="preset"
              :active="presetInAuto(preset)"
              @click="handleSelected(preset)"
            />
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-card>
  <v-sheet v-else class="pa-2 preset-menu">
    <div class="text-body-1 d-flex justify-space-between align-center">
      <span class="px-4">{{ $t("views.multiview.changeLayout") }}</span>
      <v-btn text @click="$emit('showAll')">
        {{ $t("views.favorites.showall") }}
      </v-btn>
    </div>
    <v-row class="ml-1 text-body-1 d-flex align-center">
      <span class="pl-4 pr-2">Chat Defaults:</span>
      <v-btn
        :color="defaultShowYtChat ? 'primary' : ''"
        small
        @click.stop="toggleDefaultYtChat"
      >
        <v-icon small class="mr-1">
          {{ icons.ytChat }}
        </v-icon>
        Chat
      </v-btn>
      <v-btn
        class="ml-1"
        :color="defaultShowTlChat ? 'primary' : ''"
        small
        @click.stop="toggleDefaultTlChat"
      >
        <v-icon small class="mr-1">
          {{ icons.tlChat }}
        </v-icon>
        TL
      </v-btn>
    </v-row>
    <v-row class="ml-1 mt-1">
      <template v-for="preset in currentGroup">
        <v-col :key="preset.name" cols="auto" class="justify-center pa-1">
          <LayoutPreviewCard
            :scale="0.8"
            :preset="preset"
            :active="presetInAuto(preset)"
            @click="handleSelected(preset)"
          />
        </v-col>
      </template>
    </v-row>
  </v-sheet>
</template>

<script lang="ts">
import { mdiDotsVertical, mdiToggleSwitch } from "@mdi/js";
import { decodeLayout } from "@/utils/mv-utils";
import { mapState, mapGetters, mapMutations } from "vuex";
import LayoutPreviewCard from "./LayoutPreviewCard.vue";

export default {
    name: "PresetSelector",
    components: {
        LayoutPreviewCard,
    },
    props: {
        slim: {
            type: Boolean,
        },
    },
    data() {
        return {
            mdiDotsVertical,
            mdiToggleSwitch,
            currentTab: 0,
            editAutoLayout: false,
            showCustom: false,
        };
    },
    computed: {
        ...mapState("multiview", ["presetLayout", "autoLayout", "activeVideos", "layout", "layoutContent", "defaultShowYtChat", "defaultShowTlChat"]),
        ...mapGetters("multiview", [
            "decodedCustomPresets",
            "decodedMobilePresets",
            "desktopGroups",
            "activeVideos",
        ]),
        autoLayoutSet() {
            return new Set(this.autoLayout);
        },
        totalVideoCells() {
            return this.layout.filter((l) => !this.layoutContent[l.i] || this.layoutContent[l.i].type !== "chat").length;
        },
        currentGroup() {
            if (this.$store.state.isMobile) return this.decodedMobilePresets;
            const layouts = (this.activeVideos.length < this.desktopGroups.length) && this.desktopGroups[this.activeVideos.length];
            return layouts || this.desktopGroups[1];
        },
    },
    methods: {
        ...mapMutations("multiview", ["setDefaultYtChat", "setDefaultTlChat"]),
        setAutoLayout(index, encodedLayout) {
            this.$store.commit("multiview/setAutoLayout", { index, encodedLayout });
        },
        decodeLayout,
        handleSelected(preset) {
            this.$emit("selected", preset);
        },
        removePresetLayout(preset) {
            const presetIdx = this.autoLayout.findIndex((l) => l === preset.id);
            if (presetIdx >= 0) this.setAutoLayout(presetIdx, null);
            this.$store.commit("multiview/removePresetLayout", preset.name);
        },
        presetInAuto(preset) {
            return this.autoLayoutSet.has(preset.id);
        },
        toggleDefaultYtChat() {
            this.setDefaultYtChat(!this.defaultShowYtChat);
        },
        toggleDefaultTlChat() {
            this.setDefaultTlChat(!this.defaultShowTlChat);
        },
    },
};
</script>

<style>
.is-auto-layout {
    color: var(--v-anchor-base);
}

.preset-menu {
  max-width: 550px;
  width: 80vw;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
