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
            {{ icons.mdiPencil }}
          </v-icon>
          {{ editAutoLayout ? "Done" : "Edit Autolayout" }}
        </v-btn>
        <template v-for="(group, index) in desktopGroups">
          <v-radio-group
            :key="'preset-' + index"
            :value="autoLayout[index]"
            column
            hide-details
            class="ma-0"
          >
            <v-card-subtitle v-if="index !== 0" class="text-body-1 pa-1">
              {{ $t("component.channelInfo.videoCount", [index]) }}
            </v-card-subtitle>
            <v-row v-if="group" :key="'desktop-' + index">
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
  <v-sheet v-else style="max-width: 550px; width: 80vw;" class="pa-2">
    <div class="text-body-1 d-flex justify-space-between align-center">
      <span class="px-4">Change Layout</span>
      <v-btn text @click="$emit('showAll')">
        Show All
      </v-btn>
    </div>
    <v-row class="ml-1">
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
import { mapState, mapGetters } from "vuex";
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
        ...mapState("multiview", ["presetLayout", "autoLayout"]),
        ...mapGetters("multiview", [
            "decodedCustomPresets",
            "decodedMobilePresets",
            "desktopGroups",
            "activeVideos",
        ]),
        autoLayoutSet() {
            return new Set(this.autoLayout);
        },
        currentGroup() {
            if (this.$store.state.isMobile) return this.decodedMobilePresets;
            const layouts = (this.activeVideos.length < this.desktopGroups.length) && this.desktopGroups[this.activeVideos.length];
            return (layouts && layouts.length) ? layouts : this.desktopGroups[1];
        },
    },
    methods: {
        setAutoLayout(index, encodedLayout) {
            this.$store.commit("multiview/setAutoLayout", { index, encodedLayout });
        },
        decodeLayout,
        handleSelected(preset) {
            this.$emit("selected", preset);
        },
        removePresetLayout(preset) {
            this.$store.commit("multiview/removePresetLayout", preset.name);
        },
        presetInAuto(preset) {
            return this.autoLayoutSet.has(preset.id);
        },
    },
};
</script>

<style>
.is-auto-layout {
    color: var(--v-anchor-base);
}
</style>
