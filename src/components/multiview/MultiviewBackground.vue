<template>
  <div
    class="mv-background"
  >
    <template v-if="showTips">
      <div v-if="!collapseToolbar" style="max-width: 50%; display: inline-block">
        <div style="display: inline-block; margin-right: 20px; margin-left: 10px">
          <div style="height: 10vh; border: 1px solid gray; width: 1px; margin-left: 50%" />
          {{ $t("views.multiview.autoLayoutTip") }}
        </div>
      </div>
      <div v-if="!collapseToolbar" style="max-width: 50%; display: inline-block; float: right">
        <div style="display: inline-block; margin-right: 10px">
          <div style="height: 10vh; border: 1px solid gray; width: 1px; margin-left: 50%" />
          {{ $t("views.multiview.createLayoutTip") }}
        </div>
      </div>
      <div v-if="collapseToolbar" style="max-width: 50%; display: inline-block; float: right">
        <div style="display: inline-block; margin-right: 10px">
          <div style="height: 10vh; border: 1px solid gray; width: 1px; margin-left: 95%; margin-top: 28px" />
          {{ $t("views.multiview.openToolbarTip") }}
        </div>
      </div>
      <div style="padding-top: 10vh" class="d-flex justify-center">
        <div class="hints">
          <div class="text-h4">
            {{ $t("views.multiview.hints") }}
          </div>
          <div>1. <v-icon>{{ icons.mdiGridLarge }}</v-icon> {{ $t("views.multiview.presetsHint") }}</div>
          <!-- <div>2. <v-icon>{{ mdiContentSave }}</v-icon> Customize your experience by creating and saving layouts</div> -->
          <div>
            2.
            <v-icon>{{ mdiTuneVertical }}</v-icon>
            {{ $t("views.multiview.mediaControlsHint1") }}
            <v-icon>{{ mdiFastForward }}</v-icon>
            {{ $t("views.multiview.mediaControlsHint2") }}
          </div>
          <div>3. <v-icon>{{ mdiCardPlus }}</v-icon> {{ $t("views.multiview.dragDropHint") }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
    mdiCardPlus, mdiTuneVertical, mdiFastForward,
} from "@mdi/js";

export default {
    name: "MultiviewBackground",
    props: {
        collapseToolbar: {
            type: Boolean,
            default: false,
        },
        showTips: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            mdiCardPlus,
            mdiFastForward,
            mdiTuneVertical,
        };
    },
};
</script>

<style>
.mv-background {
    opacity: 0.75;
    position: absolute;
    width: 100%;
    background-repeat: initial;
    background-image: linear-gradient(to right, rgba(128, 128, 128, 0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(128, 128, 128, 0.15) 1px, transparent 1px);
}
</style>
