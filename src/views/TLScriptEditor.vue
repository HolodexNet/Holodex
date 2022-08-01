<template>
  <v-container
    fill-height
    fluid
    style="max-height: 100vh; padding: 0px 12px"
    @keydown.ctrl.83.exact.prevent="processLog()"
  >
    <div class="d-flex flex-column" style="height: 100%; width: 100%">
      <v-system-bar height="30" class="px-0 tl-topbar" color="secondary">
        <v-btn small outlined to="/">
          <v-icon>{{ icons.mdiHome }}</v-icon>
        </v-btn>

        <v-btn
          small
          outlined
          @click="
            modalMode = 5;
            modalNexus = true;
          "
        >
          {{ $t("views.tlClient.menu.setting") }}
        </v-btn>
        <v-btn small outlined @click="processLog()">
          {{ $t("views.scriptEditor.menu.save") }} <code>Ctrl-S</code>
        </v-btn>
        <!-- <v-btn
          small
          outlined
          @click="modalMode = 3; modalNexus = true; activeURLInput = activeURLStream;"
        >
          {{ $t("views.tlClient.menu.loadVideo") }}
        </v-btn>
        <v-btn
          small
          outlined
          @click="unloadVideo()"
        >
          {{ $t("views.tlClient.menu.unloadVideo") }}
        </v-btn> -->
        <v-btn
          small
          outlined
          @click="
            modalMode = 6;
            modalNexus = true;
          "
        >
          {{ $t("views.scriptEditor.menu.exportFile") }}
        </v-btn>
        <v-btn small outlined @click="importPanelShow = true">
          {{ $t("views.scriptEditor.menu.importFile") }}
        </v-btn>
        <v-btn small outlined @click="continuousTime()">
          {{ $t("views.scriptEditor.menu.continuousEnd") }}
        </v-btn>
        <v-btn
          small
          outlined
          @click="
            modalMode = 9;
            modalNexus = true;
          "
        >
          Time Shift
        </v-btn>
        <v-btn
          v-if="videoData && videoData.id === 'custom'"
          small
          outlined
          @click="
            modalMode = 10;
            modalNexus = true;
            linkInput = activeURLStream;
          "
        >
          Change Custom Link
        </v-btn>
        <!-- <v-btn
          small
          color="warning"
          @click="modalMode = 8; modalNexus = true"
        >
          {{ $t("views.scriptEditor.menu.editorMode") }}
        </v-btn> -->
        <v-btn
          small
          color="error"
          @click="
            modalMode = 7;
            modalNexus = true;
          "
        >
          {{ $t("views.scriptEditor.menu.clearAll") }}
        </v-btn>
      </v-system-bar>
      <div
        class="flex-row d-flex align-stretch"
        style="height: 100%"
        @click="menuBool = false"
      >
        <v-card
          ref="tableContainer"
          class="grow"
          height="100%"
          width="50%"
        >
          <v-simple-table
            :fixed-header="!menuBool"
            :height="tableHeightCalculator"
            width="auto"
          >
            <thead @click="selectedEntry = -1">
              <tr>
                <th class="text-left">
                  {{ $t("views.scriptEditor.table.headerStart") }}
                </th>
                <th class="text-left">
                  {{ $t("views.scriptEditor.table.headerEnd") }}
                </th>
                <th class="text-left">
                  {{ $t("views.scriptEditor.table.headerProfile") }}
                </th>
                <th class="text-left" style="width: 100%">
                  {{ $t("views.scriptEditor.table.headerText") }}
                </th>
                <th>
                  <v-card-actions
                    v-if="!vidPlayer"
                    class="flex-row ControlBox d-flex"
                  >
                    <v-btn small @click="timerTimeStop()">
                      <v-icon dark>
                        {{ mdiStop }}
                      </v-icon>
                    </v-btn>
                    <span>{{ timerPrint }}</span>
                    <v-btn small @click="timerTimeStart()">
                      <v-icon dark>
                        {{ mdiPlay }}
                      </v-icon>
                    </v-btn>
                  </v-card-actions>
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(entry, index) in entries">
                <Entrytr
                  v-if="selectedEntry !== index"
                  :key="index"
                  :time="entry.Time"
                  :duration="entry.Duration"
                  :stext="entry.SText"
                  :profile-name="profile[entry.Profile].Name"
                  :cc="
                    profile[entry.Profile].useCC
                      ? profile[entry.Profile].CC
                      : ''
                  "
                  :oc="
                    profile[entry.Profile].useOC
                      ? profile[entry.Profile].OC
                      : ''
                  "
                  :use-real-time="videoData.id === 'custom'"
                  :real-time="entry.realTime"
                  @click.native="selectedEntry = index"
                />
                <tr v-if="selectedEntry === index" :key="index">
                  <td>{{ timeStampStart }}</td>
                  <td>{{ timeStampEnd }}</td>
                  <td>
                    <v-select
                      v-model="entry.Profile"
                      :items="profileListPicker"
                      item-text="name"
                      item-value="idx"
                      single-line
                      @change="logChange(entries[selectedEntry].id)"
                    />
                  </td>
                  <td colspan="2">
                    <v-text-field
                      v-model="entry.SText"
                      class="font-weight: bold;"
                      :style="textStyle2"
                      @change="logChange(entries[selectedEntry].id)"
                    />
                  </td>
                </tr>
                <tr v-if="selectedEntry === index" :key="index + 'control'">
                  <td colspan="5">
                    <v-card-actions
                      class="flex-row d-flex justify-space-around"
                    >
                      <v-btn
                        @click="
                          modalMode = 4;
                          modalNexus = true;
                        "
                      >
                        {{ $t("views.scriptEditor.table.setAsStart") }}
                      </v-btn>
                      <v-btn @click="deleteEntry()">
                        {{ $t("views.scriptEditor.table.deleteEntry") }}
                      </v-btn>
                    </v-card-actions>
                  </td>
                </tr>
              </template>
            </tbody>
          </v-simple-table>
          <v-card
            v-if="profileDisplay"
            class="ProfileListCard d-flex flex-column"
          >
            <span
              v-for="(prf, index) in profile"
              :key="index"
            ><span v-if="index === profileIdx">> </span>{{ index + 1 + ". " + prf.Name }}</span>
          </v-card>
        </v-card>
        <v-card
          v-if="vidPlayer"
          height="100%"
          width="50%"
          class="d-flex flex-column"
          outlined
        >
          <v-card id="player" height="100%" width="100%" />
          <v-card class="flex-row justify-center d-flex">
            <EnhancedEntry
              v-if="displayEntry >= 0 && displayEntry < entries.length"
              :stext="entries[displayEntry].SText"
              :cc="
                profile[entries[displayEntry].Profile].useCC
                  ? profile[entries[displayEntry].Profile].CC
                  : ''
              "
              :oc="
                profile[entries[displayEntry].Profile].useOC
                  ? profile[entries[displayEntry].Profile].OC
                  : ''
              "
            />
          </v-card>
          <v-card-actions class="flex-row justify-center d-flex">
            <v-btn small @click="timerTimeStop()">
              <v-icon dark>
                {{ mdiStop }}
              </v-icon>
            </v-btn>
            <span>{{ timerPrint }}</span>
            <v-btn small @click="timerTimeStart()">
              <v-icon dark>
                {{ mdiPlay }}
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <v-container
        @click="menuBool = false"
        @keydown.up.exact="profileUp()"
        @keydown.down.exact="profileDown()"
        @keydown.tab.exact.prevent="profileDown()"
        @keydown.shift.tab.exact.prevent="profileJumpToDefault()"
        @keydown.ctrl.49.exact.prevent="profileJump(0)"
        @keydown.ctrl.50.exact.prevent="profileJump(1)"
        @keydown.ctrl.51.exact.prevent="profileJump(2)"
        @keydown.ctrl.52.exact.prevent="profileJump(3)"
        @keydown.ctrl.53.exact.prevent="profileJump(4)"
        @keydown.ctrl.54.exact.prevent="profileJump(5)"
        @keydown.ctrl.55.exact.prevent="profileJump(6)"
        @keydown.ctrl.56.exact.prevent="profileJump(7)"
        @keydown.ctrl.57.exact.prevent="profileJump(8)"
        @keydown.ctrl.space="ctrlSpace()"
        @keydown.ctrl.left="ctrlLeft()"
        @keydown.ctrl.right="ctrlRight()"
      >
        <v-row class="align-baseline">
          <v-card
            style="
              display: flex;
              flex-direction: column;
              padding-bottom: 7px;
              margin-bottom: 5px;
            "
          >
            <v-card style="position: relative">
              <div class="Marker" />

              <div
                ref="TimelineDiv"
                class="TimelineContainer"
                :style="{ scrollBehavior: jumpScrollRender }"
              >
                <v-card
                  class="TimelineInnerContainer"
                  :style="{ width: 3 * secToPx * secPerBar + 'px' }"
                >
                  <canvas
                    ref="TimeCanvas1"
                    :style="{
                      height: barHeight + 'px',
                      width: secToPx * secPerBar + 'px',
                    }"
                  />
                  <canvas
                    ref="TimeCanvas2"
                    :style="{
                      height: barHeight + 'px',
                      width: secToPx * secPerBar + 'px',
                    }"
                  />
                  <canvas
                    ref="TimeCanvas3"
                    style="margin-right: auto"
                    :style="{
                      height: barHeight + 'px',
                      width: secToPx * secPerBar + 'px',
                    }"
                  />
                </v-card>

                <div
                  class="flex-row d-flex"
                  style="margin-left: 40%"
                  :style="{ width: 3 * secToPx * secPerBar + 'px' }"
                  @mouseleave="rulerMouseLeave()"
                  @mouseup="rulerMouseUp()"
                  @mousemove="rulerMouseMove($event)"
                >
                  <template v-for="(idx, index) in timecardIdx">
                    <div
                      :key="idx + 'frontdiv'"
                      :style="{ width: cardFiller(index) + 'px' }"
                    />
                    <v-card
                      :key="idx + 'card'"
                      class="flex-row rounded-lg d-flex align-center Timecard"
                      elevation="2"
                      outlined
                      :style="{
                        fontsize: fontSize + 'px',
                        width: cardWidth(index) + 'px',
                      }"
                    >
                      <div
                        style="
                          width: 3px;
                          background-color: transparent;
                          height: 100%;
                          cursor: ew-resize;
                        "
                        @mousedown="rulerMouseDown($event, idx, 0)"
                      />
                      <EnhancedEntry
                        :stext="entries[idx].SText"
                        :cc="
                          profile[entries[idx].Profile].useCC
                            ? profile[entries[idx].Profile].CC
                            : ''
                        "
                        :oc="
                          profile[entries[idx].Profile].useOC
                            ? profile[entries[idx].Profile].OC
                            : ''
                        "
                        class="TimecardText"
                        @mousedown.native="rulerMouseDown($event, idx, 1)"
                      />
                      <div
                        style="
                          width: 3px;
                          background-color: transparent;
                          height: 100%;
                          cursor: ew-resize;
                        "
                        @mousedown="rulerMouseDown($event, idx, 2)"
                      />
                    </v-card>
                  </template>
                </div>
              </div>
            </v-card>
          </v-card>
        </v-row>
        <v-row class="">
          <v-text-field
            v-model="inputString"
            placeholder="Type TL Here <Enter key to send>"
            outlined
            hide-details
            dense
            @keypress.enter="addEntry()"
          >
            <template #prepend>
              <span style="opacity: 0.8" class="mt-1">{{
                profile[profileIdx].Prefix
              }}</span>
            </template>
            <template #append>
              <span style="opacity: 0.8" class="mt-1">{{
                profile[profileIdx].Suffix
              }}</span>
            </template>
          </v-text-field>

          <v-btn large class="mx-2" @click="addEntry()">
            {{ $t("views.tlClient.tlControl.enterBtn") }}
          </v-btn>
          <v-btn large color="primary" @click="TLSetting = !TLSetting">
            {{
              TLSetting
                ? $t("views.tlClient.tlControl.hideSetting")
                : $t("views.tlClient.tlControl.showSetting")
            }}
            <v-icon>
              {{ TLSetting ? mdiCogOff : mdiCog }}
            </v-icon>
          </v-btn>
        </v-row>
        <v-expand-transition>
          <v-card v-if="TLSetting" class="mt-2">
            <v-card-subtitle>
              Current Profile [{{ profile[profileIdx].Name }}] Settings
              <v-icon class="float-right" @click="TLSetting = false">
                {{ icons.mdiClose }}
              </v-icon>
              <v-tooltip left>
                <template #activator="{ on, attrs }">
                  <v-icon class="float-right" v-bind="attrs" v-on="on">
                    {{ mdiKeyboard }}
                  </v-icon>
                </template>
                <span>While typing in TL box</span><br>
                <span><kbd>⇧</kbd><kbd>⇩</kbd> to change Profiles</span><br>
                <span><kbd>Ctrl+[1~9]</kbd> to quick switch to Profile</span>
              </v-tooltip>
            </v-card-subtitle>
            <v-card-text class="d-flex align-stretch">
              <v-text-field
                v-model="profile[profileIdx].Prefix"
                :label="$t('views.tlClient.tlControl.prefix')"
                dense
                outlined
                hide-details
                class="mr-2"
              />
              <v-text-field
                v-model="profile[profileIdx].Suffix"
                :label="$t('views.tlClient.tlControl.suffix')"
                dense
                outlined
                hide-details
                class="mr-2"
              />
              <!--
                <v-checkbox
                    v-model="profile[profileIdx].useCC"
                    class="shrink"
                    :label="$t('views.tlClient.tlControl.fontColour') + ' : '"
                    hide-details
                />
                <v-btn
                    class="ColourButton"
                    small
                    :style="{ background: profile[profileIdx].CC }"
                    @click.stop="colourTemp = profile[profileIdx].CC; colourPick = 1; colourDialogue = true;"
                >
                    {{ profile[profileIdx].CC }}
                </v-btn>
                <v-checkbox
                    v-model="profile[profileIdx].useOC"
                    :label="$t('views.tlClient.tlControl.outlineColour') + ' : '"
                    hide-details
                />
                <v-btn
                    class="ColourButton"
                    small
                    :style="{ background: profile[profileIdx].OC }"
                    @click.stop="colourTemp = profile[profileIdx].OC; colourPick = 2; colourDialogue = true;"
                >
                    {{ profile[profileIdx].OC }}
                </v-btn>
                -->
            </v-card-text>
            <v-card-text>
              <v-btn
                style="margin-right: 5px"
                @click="
                  modalMode = 1;
                  modalNexus = true;
                  addProfileNameString = 'Profile ' + profile.length;
                "
              >
                {{ $t("views.tlClient.tlControl.addProfile") }}
              </v-btn>
              <v-btn
                style="margin-right: 5px"
                @click="
                  modalMode = 2;
                  modalNexus = true;
                "
              >
                {{ $t("views.tlClient.tlControl.removeProfile") }}
              </v-btn>
              <v-btn style="margin-right: 5px" @click="shiftProfileUp()">
                {{ $t("views.tlClient.tlControl.shiftUp") }}
              </v-btn>
              <v-btn @click="shiftProfileDown()">
                {{ $t("views.tlClient.tlControl.shiftDown") }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-expand-transition>
      </v-container>
    </div>

    <!---------   COLOUR MODAL --------->
    <v-dialog
      v-model="colourDialogue"
      max-width="300px"
      @click:outside.prevent="colourPickerClose()"
    >
      <v-card>
        <v-color-picker
          v-if="colourPick === 1"
          v-model="profile[profileIdx].CC"
        />
        <v-color-picker
          v-else-if="colourPick === 2"
          v-model="profile[profileIdx].OC"
        />
        <v-card-title :style="textStyle" style="font-weight: bold">
          {{ $t("views.tlClient.pangram") }}
        </v-card-title>
        <v-card-actions>
          <v-btn @click="colourPickerClose()">
            {{ $t("views.tlClient.cancelBtn") }}
          </v-btn>

          <v-btn style="margin-left: auto" @click="colourPickerOK()">
            {{ $t("views.tlClient.okBtn") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--========   COLOUR MODAL =======-->

    <!---------   NEXUS MODAL ---------
      1 Add profile
      2 Remove Profile
      3 Load Stream
      4 Set as Start
      5 Setting
      6 Export All
      7 Delete All
      8 Editor Mode
    -->
    <v-dialog
      v-model="modalNexus"
      :max-width="modalMode === 7 ? '300px' : '600px'"
      persistent
      @click:outside="modalNexusOutsideClick()"
    >
      <!---------    ADD PROFILE     --------->
      <v-card v-if="modalMode === 1">
        <v-container>
          <v-card-title>
            {{ $t("views.tlClient.addProfilePanel.title") }}
          </v-card-title>
          <v-text-field
            v-model="addProfileNameString"
            :label="$t('views.tlClient.addProfilePanel.inputLabel')"
            :placeholder="$t('views.tlClient.addProfilePanel.inputLabel')"
            dense
            rounded
            outlined
          />
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn style="margin-left: auto" @click="addProfile()">
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    Remove PROFILE     --------->
      <v-card v-if="modalMode === 2">
        <v-container>
          <v-card-title>
            {{
              $t("views.tlClient.removeProfileTitle") +
                " " +
                profile[profileIdx].Name
            }}.
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn style="margin-left: auto" @click="deleteProfile()">
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  LOAD VIDEO  ------->
      <v-card v-if="modalMode === 3">
        <v-container>
          <v-card-title>
            {{ $t("views.scriptEditor.loadVideoPanel.title") }}
          </v-card-title>
          <v-text-field
            v-model="activeURLInput"
            :label="$t('views.scriptEditor.loadVideoPanel.inputLabel')"
          />
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn
              style="margin-left: auto"
              @click="
                loadVideo();
                modalNexus = false;
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  SET START ENTRY  ------->
      <v-card v-if="modalMode === 4">
        <v-container>
          <v-card-title style="word-break: normal">
            {{ $t("views.scriptEditor.setStartTitle") }}
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>
            <v-btn
              style="margin-left: auto"
              @click="
                setStartEntry();
                modalNexus = false;
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    SETTING     --------->
      <v-card v-if="modalMode === 5">
        <v-container>
          <v-card-title>
            {{ $t("views.tlClient.settingPanel.title") }}
          </v-card-title>
          <v-card-subtitle>
            {{
              $t("views.watch.uploadPanel.usernameText") +
                " : " +
                userdata.user.username +
                " "
            }}
            <a
              style="text-decoration: underline; font-size: 0.7em"
              @click="changeUsernameClick()"
            >{{ $t("views.watch.uploadPanel.usernameChange") }}</a>
          </v-card-subtitle>
          <v-select
            v-model="TLLang"
            :items="TL_LANGS"
            :item-text="(item) => item.text + ' (' + item.value + ')'"
            item-value="value"
            :label="$t('views.watch.uploadPanel.tlLang')"
            return-object
            @change="localPrefix = '[' + TLLang.value + '] '"
          />
          <v-text-field
            v-model="activeURLStream"
            :label="$t('views.tlClient.settingPanel.mainStreamLink')"
          />
          <v-card-actions class="flex-row justify-center d-flex">
            <v-btn @click="settingOKClick()">
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    EXPORT ALL     --------->
      <v-card v-if="modalMode === 6">
        <ExportFile
          :entries="entries"
          :profile="profile"
          :title="userdata.user.username + ' - ' + videoData.title"
        />
      </v-card>

      <!---------    DELETE ALL     --------->
      <v-card v-if="modalMode === 7">
        <v-container>
          <v-card-title>
            {{ $t("views.scriptEditor.menu.clearAll") }}
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>
            <v-btn
              style="margin-left: auto"
              color="warning"
              @click="
                clearAll();
                modalNexus = false;
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    TIME SHIFT    --------->
      <v-card v-if="modalMode === 9">
        <v-container>
          <v-card-title> Time Shift </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="offsetInput"
              label="Offset"
              outlined
              dense
              hide-details
              type="number"
              suffix="sec"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>
            <v-btn
              style="margin-left: auto"
              @click="
                modalNexus = false;
                shiftTime();
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <v-card v-if="modalMode === 10">
        <v-container>
          <v-card-title> Change stream link </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="linkInput"
              label="New link"
              outlined
              dense
              hide-details
            />
          </v-card-text>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>
            <v-btn style="margin-left: auto" @click="modalNexus = false">
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    TIME SHIFT    --------->
      <v-card v-if="modalMode === 9">
        <v-container>
          <v-card-title> Time Shift </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="offsetInput"
              label="Offset"
              outlined
              dense
              hide-details
              type="number"
              suffix="sec"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>
            <v-btn
              style="margin-left: auto"
              @click="
                modalNexus = false;
                shiftTime();
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
    <ImportFile v-model="importPanelShow" @bounceDataBack="processImportData" />
    <!--========   NEXUS MODAL =======-->
  </v-container>
</template>

<script lang="ts">
import Entrytr from "@/components/tlscripteditor/Entrytr.vue";
import EnhancedEntry from "@/components/tlscripteditor/EnhancedEntry.vue";
import ImportFile from "@/components/tlscripteditor/ImportFile.vue";
import ExportFile from "@/components/tlscripteditor/ExportToFile.vue";
import { TL_LANGS, VIDEO_URL_REGEX } from "@/utils/consts";
import { mdiPlay, mdiStop, mdiCog, mdiCogOff, mdiKeyboard } from "@mdi/js";
import { videoCodeParser } from "@/utils/functions";
import backendApi from "@/utils/backend-api";

export default {
    name: "Tlscripteditor",
    metaInfo() {
        return {
            get title() {
                return "TLScriptEditor - Holodex";
            },
        };
    },
    components: {
        EnhancedEntry,
        Entrytr,
        ExportFile,
        ImportFile,
    },
    data() {
        return {
            TL_LANGS,
            mdiPlay,
            mdiStop,
            mdiCog,
            mdiKeyboard,
            mdiCogOff,
            TLSetting: true,
            menuBool: false,
            entries: [],
            profile: [
                {
                    Name: "Default",
                    Prefix: "",
                    Suffix: "",
                    useCC: false,
                    CC: "#000000",
                    useOC: false,
                    OC: "#000000",
                },
            ],
            profileContainer: {},
            profileIdx: 0,
            profileDisplay: false,
            profileDisplayTimer: undefined,
            inputString: "",
            tableHeight: 0,
            selectedEntry: -1,
            fontSize: 15,
            videoData: undefined,
            transactionLog: [],
            loggerTimer: undefined,
            // ------ COLOUR -------
            colourPick: 0,
            colourDialogue: false,
            colourTemp: "",
            // ------ MODAL --------
            modalNexus: true,
            modalMode: 5,
            addProfileNameString: "",
            importPanelShow: false,
            offsetInput: 0,
            linkInput: "",
            // ------ SETTING ------
            TLLang: TL_LANGS[0],
            // ---- ACTIVE VIDEO ----
            activeURLInput: "",
            activeURLStream: "",
            vidType: "",
            vidPlayer: false,
            vidIframeEle: null,
            player: null,
            IFOrigin: "",
            // ---- TIMER CONTROLLER ----
            timerActive: false,
            timerMode: 0,
            defaultRefreshRate: 1000 / 30,
            timerTime: 0,
            refreshRate: 33,
            // trackerPause: true, --> originally, to keep VOD twitch timer and script editor timer synced, but twitch VOD is not supported atm.
            // ---- TIMELINE ----
            timelineDur: 3600,
            secToPx: 100,
            secPerBar: 60,
            barHeight: 25,
            jumpScroll: true,
            barCount: 0,
            displayEntry: 0,
            timecardIdx: [],
            resizeActive: false,
            resizeMode: false,
            xPos: 0,
            // ---- EDITOR MODE ----
            editorMode: false,
            tlList: [],
        };
    },
    computed: {
        tableHeightCalculator() {
            return `${this.tableHeight}px`;
        },
        textStyle() {
            return {
                "-webkit-text-fill-color":
                    this.profile[this.profileIdx].CC === ""
                        ? "unset"
                        : this.profile[this.profileIdx].CC,
                "-webkit-text-stroke-color":
                    this.profile[this.profileIdx].OC === ""
                        ? "unset"
                        : this.profile[this.profileIdx].OC,
                "-webkit-text-stroke-width":
                    this.profile[this.profileIdx].OC === "" ? "0px" : "1px",
            };
        },
        userdata() {
            return this.$store.state.userdata;
        },
        user() {
            return this.$store.state.userdata.user;
        },
        timerPrint() {
            let timeRaw = this.timerTime;
            let timeString = "";

            let t = Math.floor(timeRaw / 60 / 60 / 1000);
            timeRaw -= t * 60 * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 60 / 1000);
            timeRaw -= t * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 1000);
            timeRaw -= t * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ".";

            if (timeRaw > 100) {
                timeString += timeRaw.toString().slice(0, 2);
            } else if (timeRaw > 10) {
                timeString += `0${timeRaw.toString().slice(0, 1)}`;
            } else {
                timeString += "00";
            }

            return timeString;
        },
        timeStampStart() {
            let timeRaw = this.entries[this.selectedEntry].Time;
            let timeString = "";

            let t = Math.floor(timeRaw / 60 / 60 / 1000);
            timeRaw -= t * 60 * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 60 / 1000);
            timeRaw -= t * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 1000);
            timeRaw -= t * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ".";

            if (timeRaw > 100) {
                timeString += timeRaw.toString().slice(0, 2);
            } else if (timeRaw > 10) {
                timeString += `0${timeRaw.toString().slice(0, 1)}`;
            } else {
                timeString += "00";
            }

            return timeString;
        },
        timeStampEnd() {
            let timeRaw = this.entries[this.selectedEntry].Time
                + this.entries[this.selectedEntry].Duration;
            let timeString = "";

            let t = Math.floor(timeRaw / 60 / 60 / 1000);
            timeRaw -= t * 60 * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 60 / 1000);
            timeRaw -= t * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 1000);
            timeRaw -= t * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ".";

            if (timeRaw > 100) {
                timeString += timeRaw.toString().slice(0, 2);
            } else if (timeRaw > 10) {
                timeString += `0${timeRaw.toString().slice(0, 1)}`;
            } else {
                timeString += "00";
            }

            return timeString;
        },
        textStyle2() {
            return {
                "-webkit-text-fill-color": !this.profile[
                    this.entries[this.selectedEntry].Profile
                ].useCC
                    ? "unset"
                    : this.profile[this.entries[this.selectedEntry].Profile].CC,
                "-webkit-text-stroke-color": !this.profile[
                    this.entries[this.selectedEntry].Profile
                ].useOC
                    ? "unset"
                    : this.profile[this.entries[this.selectedEntry].Profile].OC,
                "-webkit-text-stroke-width": !this.profile[
                    this.entries[this.selectedEntry].Profile
                ].useOC
                    ? "0px"
                    : "1px",
            };
        },
        profileListPicker() {
            const profileList = [];
            for (let i = 0; i < this.profile.length; i += 1) {
                profileList.push({
                    idx: i,
                    name: this.profile[i].Name,
                });
            }
            return profileList;
        },
        jumpScrollRender() {
            return this.jumpScroll ? "unset" : "smooth";
        },
        elevatedUser() {
            return this.user.role === "admin" || this.user.role === "editor";
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query.video": function () {
            if (this.$route.name === "scripteditor" && this.$route.query.video) {
                this.init();
            }
        },
        timerTime() {
            this.scrollCalculator();

            if (this.timecardIdx.length === 0) {
                this.displayEntry = -1;
                return;
            }

            if (this.timerTime < this.entries[this.timecardIdx[0]].Time) {
                this.displayEntry = -1;
                return;
            }

            if (this.entries[this.displayEntry]) {
                if (
                    this.timerTime > this.entries[this.displayEntry].Time
                    && this.entries[this.displayEntry].Time
                        + this.entries[this.displayEntry].Duration
                        > this.timerTime
                ) {
                    return;
                }
            }

            for (let i = this.timecardIdx.length - 1; i >= 0; i -= 1) {
                if (this.timerTime > this.entries[this.timecardIdx[i]].Time) {
                    this.displayEntry = this.timecardIdx[i];
                    return;
                }
            }
        },
    },
    mounted() {
        this.init();
        this.loggerTimer = setInterval(() => {
            this.processLog(false);
        }, 15 * 1000);
    },
    created() {
        window.addEventListener("resize", this.onResize);
        if (!this.$refs.tableContainer?.$el) {
            return;
        }
        const checker = setInterval(() => {
            this.tableHeight = this.$refs.tableContainer.$el.clientHeight - 20;
            if (this.tableHeight !== 0) {
                clearInterval(checker);
            }
        }, 33);
    },
    beforeDestroy() {
        this.unloadVideo();
        window.removeEventListener("resize", this.onResize);
        if (this.loggerTimer) {
            clearInterval(this.loggerTimer);
        }
        this.processLog(true);
    },
    methods: {
        init() {
            this.checkLoginValidity();
            this.rerenderTimeline();
            this.activeURLStream = videoCodeParser(this.$route.query.video);
            this.modalNexus = true;
            this.modalMode = 5;
            this.editorMode = false;
        },
        onResize() {
            this.tableHeight = 0;
            if (!this.$refs.tableContainer?.$el) {
                return;
            }
            const checker = setInterval(() => {
                this.tableHeight = this.$refs.tableContainer.$el.clientHeight - 20;
                if (this.tableHeight !== 0) {
                    clearInterval(checker);
                }
            }, 33);
        },
        addEntry() {
            const dt = {
                id: Date.now(),
                Time: this.timerTime,
                Duration: 3000,
                SText:
                    this.profile[this.profileIdx].Prefix
                    + this.inputString
                    + this.profile[this.profileIdx].Suffix,
                Profile: this.profileIdx,
            };

            let inserted: boolean = false;
            for (let i = 0; i < this.entries.length; i += 1) {
                if (this.entries[i].Time > dt.Time) {
                    if (i > 0) {
                        this.entries[i - 1].Duration = dt.Time - this.entries[i - 1].Time;
                        this.logChange(this.entries[i - 1].id);
                    }

                    if (i < this.entries.length) {
                        dt.Duration = this.entries[i].Time - dt.Time;
                    }

                    this.entries.splice(i, 0, dt);
                    this.displayEntry = i;
                    inserted = true;
                    this.inputString = "";
                    this.reloadDisplayCards();
                    break;
                }
            }

            if (!inserted) {
                if (this.entries.length !== 0) {
                    this.entries[this.entries.length - 1].Duration = dt.Time - this.entries[this.entries.length - 1].Time;
                    this.logChange(this.entries[this.entries.length - 1].id);
                }
                this.entries.push(dt);
                this.displayEntry = this.entries.length - 1;
                this.inputString = "";
                this.reloadDisplayCards();
            }

            this.transactionLog.push({
                type: "Add",
                id: dt.id,
            });
        },
        clearAll() {
            this.displayEntry = -1;
            this.timecardIdx = [];
            this.selectedEntry = -1;

            for (; this.entries.length > 0;) {
                const tempEntries = this.entries.splice(0, 1)[0];
                let checkNew = this.transactionLog.filter(
                    (e) => e.id === tempEntries.id,
                );
                if (checkNew.length === 0) {
                    this.transactionLog.push({
                        type: "Delete",
                        id: tempEntries.id,
                    });
                } else {
                    checkNew = checkNew.filter((e) => e.type === "Change");
                    if (checkNew.length === 0) {
                        this.transactionLog = this.transactionLog.filter(
                            (e) => e.id !== tempEntries.id,
                        );
                    } else {
                        this.transactionLog = this.transactionLog.filter(
                            (e) => e.id !== tempEntries.id,
                        );
                        this.transactionLog.push({
                            type: "Delete",
                            id: tempEntries.id,
                        });
                    }
                }
            }

            this.processLog(false);
            this.reloadDisplayCards();
        },
        continuousTime() {
            this.displayEntry = -1;
            this.timecardIdx = [];
            this.selectedEntry = -1;

            for (let idx = 0; idx < this.entries.length - 1; idx += 1) {
                if (
                    this.entries[idx].Time + this.entries[idx].Duration
                    < this.entries[idx + 1].Time
                ) {
                    this.entries[idx].Duration = this.entries[idx + 1].Time - this.entries[idx].Time;
                    this.logChange(this.entries[idx].id);
                }
            }

            this.processLog(false);
            this.reloadDisplayCards();
        },
        logChange(ID) {
            if (this.transactionLog.filter((e) => e.id === ID).length === 0) {
                this.transactionLog.push({
                    type: "Change",
                    id: ID,
                });
            }
        },
        getEntryByID(ID: string) {
            const entry = this.entries.filter((e) => e.id === ID);
            if (entry.length === 0) {
                return undefined;
            }
            return entry[0];
        },
        processLog(forget: boolean) {
            if (this.transactionLog.length > 0) {
                const logCopy = [];
                for (; this.transactionLog.length > 0;) {
                    logCopy.push(this.transactionLog.splice(0, 1)[0]);
                }

                const processedLog = [];
                logCopy.forEach((e) => {
                    if (e.type === "Delete") {
                        processedLog.push({
                            type: "Delete",
                            data: {
                                id: e.id,
                            },
                        });
                    } else if (e.type === "Change") {
                        const entry = this.getEntryByID(e.id);
                        if (entry) {
                            processedLog.push({
                                type: "Change",
                                data: {
                                    lang: this.TLLang.value,
                                    id: entry.id,
                                    name: this.userdata.user.username,
                                    timestamp: Math.floor(
                                        this.videoData.start_actual
                                            ? this.videoData.start_actual + entry.Time
                                            : entry.realTime,
                                    ),
                                    message: entry.SText,
                                    duration: Math.floor(entry.Duration),
                                },
                            });
                        }
                    } else if (e.type === "Add") {
                        const entry = this.getEntryByID(e.id);
                        if (entry) {
                            processedLog.push({
                                type: "Add",
                                data: {
                                    tempid: entry.id,
                                    name: this.userdata.user.username,
                                    timestamp: Math.floor(
                                        this.videoData.start_actual
                                            ? this.videoData.start_actual + entry.Time
                                            : entry.realTime,
                                    ),
                                    message: entry.SText,
                                    duration: Math.floor(entry.Duration),
                                },
                            });
                        }
                    }
                });

                const postTLOption = {
                    videoId: this.videoData.id,
                    jwt: this.userdata.jwt,
                    body: processedLog,
                    lang: this.TLLang.value,
                    override: this.editorMode,
                    ...(this.videoData.id === "custom" && {
                        custom_video_id: this.videoData.custom_video_id,
                    }),
                };
                if (forget) {
                    backendApi.postTLLog(postTLOption);
                } else {
                    backendApi
                        .postTLLog(postTLOption)
                        .then(({ status, data }) => {
                            if (status === 200) {
                                data.forEach((e) => {
                                    if (e.type === "Add") {
                                        for (let idx = 0; idx < this.entries.length; idx += 1) {
                                            if (this.entries[idx].id === e.tempid) {
                                                this.entries[idx].id = e.res.id;
                                                break;
                                            }
                                        }
                                        for (
                                            let idx = 0;
                                            idx < this.transactionLog.length;
                                            idx += 1
                                        ) {
                                            if (this.transactionLog[idx].id === e.tempid) {
                                                this.transactionLog[idx].id = e.res.id;
                                            }
                                        }
                                    }
                                });
                            }
                        })
                        .catch((err) => {
                            console.log(`ERR : ${err}`);
                            // eslint-disable-next-line no-alert
                            alert(`Failed to save: ${err}`);
                        });
                }
            }
        },
        // ----------------------- TIMER CONTROLLER -----------------------
        proceedTimer(lastTime: number) {
            const nowFreeze = Date.now();
            if (!this.timerActive) {
                return;
            }

            switch (this.timerMode) {
                case 0: {
                    if (nowFreeze - lastTime < 1000) {
                        this.timerTime += nowFreeze - lastTime;
                    }
                    this.scrollCalculator();
                    break;
                }

                case 1: {
                    this.timerTime = this.player.getCurrentTime() * 1000;
                    this.scrollCalculator();
                    break;
                }

                default:
                    return;
            }
            if (nowFreeze - lastTime < this.refreshRate) {
                setTimeout(() => {
                    this.proceedTimer(nowFreeze);
                }, this.refreshRate - nowFreeze + lastTime);
            } else {
                this.proceedTimer(nowFreeze);
            }
        },
        timerTimeStart() {
            if (this.vidPlayer) {
                switch (this.vidType) {
                    case "twitch":
                        this.player.play();
                        break;

                    case "twitch_vod":
                        this.player.play();
                        break;

                    case "twitcast":
                        this.startPing();
                        break;

                    case "twitcast_vod":
                        this.startPing();
                        break;

                    case "niconico":
                        break;

                    case "niconico_vod":
                        this.startPing();
                        break;

                    case "bilibili":
                        break;

                    case "bilibili_vod":
                        this.startPing();
                        break;

                    default:
                        this.player.playVideo();
                        break;
                }
            } else if (!this.timerActive) {
                this.timerMode = 0;
                this.refreshRate = this.defaultRefreshRate;
                this.timerActive = true;
                this.proceedTimer(Date.now());
            }
        },
        timerTimeStop() {
            if (this.vidPlayer) {
                switch (this.vidType) {
                    case "twitch":
                        this.player.pause();
                        break;

                    case "twitch_vod":
                        this.player.pause();
                        break;

                    case "twitcast":
                        this.pausePing();
                        break;

                    case "twitcast_vod":
                        this.pausePing();
                        break;

                    case "niconico":
                        break;

                    case "niconico_vod":
                        this.pausePing();
                        break;

                    case "bilibili":
                        break;

                    case "bilibili_vod":
                        this.pausePing();
                        break;

                    default:
                        this.player.pauseVideo();
                        break;
                }
            } else if (this.timerActive) {
                this.timerActive = false;
            }
        },
        seekVideo(time: number) {
            if (this.vidPlayer) {
                switch (this.vidType) {
                    case "twitch":
                        // NO
                        break;

                    case "twitch_vod":
                        this.player.seek(this.timerTime / 1000 + time / 1000);
                        break;

                    case "twitcast":
                        // NO
                        break;

                    case "twitcast_vod":
                        this.timePing(time);
                        break;

                    case "niconico":
                        break;

                    case "niconico_vod":
                        this.timePing(time);
                        break;

                    case "bilibili":
                        break;

                    case "bilibili_vod":
                        this.timePing(time);
                        break;

                    default:
                        this.player.seekTo(
                            this.player.getCurrentTime() + time / 1000,
                            true,
                        );
                        break;
                }
            } else if (this.timerTime + time < 0) {
                this.timerTime = 0;
            } else {
                this.timerTime += time;
            }
        },
        ctrlRight() {
            this.seekVideo(3000);
        },
        ctrlLeft() {
            this.seekVideo(-3000);
        },
        ctrlSpace() {
            if (this.vidPlayer) {
                switch (this.vidType) {
                    case "twitch":
                        if (this.player.isPaused()) {
                            this.timerTimeStart();
                        } else {
                            this.timerTimeStop();
                        }
                        break;

                    case "twitch_vod":
                        if (this.player.isPaused()) {
                            this.timerTimeStart();
                        } else {
                            this.timerTimeStop();
                        }
                        break;

                    case "twitcast":
                        this.switchPing();
                        break;

                    case "twitcast_vod":
                        this.switchPing();
                        break;

                    case "niconico":
                        break;

                    case "niconico_vod":
                        this.switchPing();
                        break;

                    case "bilibili":
                        break;

                    case "bilibili_vod":
                        this.switchPing();
                        break;

                    default:
                        if (this.player.getPlayerState() !== 1) {
                            this.timerTimeStart();
                        } else if (this.player.getPlayerState() === 1) {
                            this.timerTimeStop();
                        }
                        break;
                }
            } else if (this.timerActive) {
                this.timerTimeStop();
            } else {
                this.timerTimeStart();
            }
        },
        //= ====================== TIMER CONTROLLER =======================

        // ------------------------ PROFILE CONTROLLER ------------------------
        shiftProfileUp() {
            if (this.profileIdx > 1) {
                this.profileContainer = JSON.parse(
                    JSON.stringify(this.profile[this.profileIdx - 1]),
                );
                this.profile[this.profileIdx - 1] = this.profile[this.profileIdx];
                this.profile[this.profileIdx] = this.profileContainer;
                this.profileIdx -= 1;
                this.profileContainer = {};
            }
            this.showProfileList();
        },
        shiftProfileDown() {
            if (this.profileIdx !== 0 && this.profileIdx < this.profile.length - 1) {
                this.profileContainer = JSON.parse(
                    JSON.stringify(this.profile[this.profileIdx + 1]),
                );
                this.profile[this.profileIdx + 1] = this.profile[this.profileIdx];
                this.profile[this.profileIdx] = this.profileContainer;
                this.profileIdx += 1;
                this.profileContainer = {};
            }
            this.showProfileList();
        },
        profileUp() {
            if (this.profileIdx === 0) {
                this.profileIdx = this.profile.length - 1;
            } else {
                this.profileIdx -= 1;
            }
            this.showProfileList();
        },
        profileDown() {
            if (this.profileIdx === this.profile.length - 1) {
                this.profileIdx = 0;
            } else {
                this.profileIdx += 1;
            }
            this.showProfileList();
        },
        profileJump(idx: number) {
            if (idx < this.profile.length) {
                this.profileIdx = idx;
            }
            this.showProfileList();
        },
        profileJumpToDefault() {
            this.profileIdx = 0;
            this.showProfileList();
        },
        addProfile() {
            if (this.addProfileNameString.trim() === "") {
                this.addProfileNameString = `Profile ${this.profile.length}`;
            }
            this.profile.push({
                Name: this.addProfileNameString,
                Prefix: "",
                Suffix: "",
                useCC: false,
                CC: "#000000",
                useOC: false,
                OC: "#000000",
            });
            this.profileIdx = this.profile.length - 1;
            this.modalNexus = false;
            this.showProfileList();
        },
        deleteProfile() {
            if (this.profileIdx !== 0) {
                this.entries
                    .filter((e) => e.Profile === this.profileIdx)
                    .map((e) => {
                        e.Profile = 0;
                        return e;
                    });

                this.profileIdx -= 1;
                this.profile.splice(this.profileIdx + 1, 1);
            }
            this.modalNexus = false;
            this.showProfileList();
        },
        showProfileList() {
            if (!this.profileDisplay) {
                this.profileDisplay = true;
            }

            if (this.profileDisplayTimer) {
                clearInterval(this.profileDisplayTimer);
            }

            this.profileDisplayTimer = setInterval(() => {
                this.profileDisplay = false;
                clearInterval(this.profileDisplayTimer);
            }, 3000);
        },
        colourPickerClose() {
            if (this.colourPick === 1) {
                this.profile[this.profileIdx].CC = this.colourTemp;
            } else if (this.colourPick === 2) {
                this.profile[this.profileIdx].OC = this.colourTemp;
            }
            this.colourDialogue = false;
        },
        colourPickerOK() {
            this.colourDialogue = false;
        },
        //= ======================== PROFILE CONTROLLER ========================

        // ---------------------- VIDEO CONTROLLER ----------------------
        loadVideo() {
            this.activeURLStream = this.activeURLInput;
            this.vidPlayer = true;
            const checker = setInterval(() => {
                const PlayerDiv = document.getElementById("player");
                if (PlayerDiv) {
                    clearInterval(checker);
                    if (this.timerActive) {
                        this.timerActive = false;
                    }
                    const isCustom = !VIDEO_URL_REGEX.test(this.activeURLStream);
                    if (!isCustom) { this.loadVideoYT(this.activeURLStream.match(VIDEO_URL_REGEX)[5]); }
                    // const StreamURL = getVideoIDFromUrl(this.activeURLStream);
                    // if (StreamURL) {
                    //     this.vidType = StreamURL.type;
                    //     switch (StreamURL.type) {
                    //         case "twitch":
                    //             this.loadVideoTW(StreamURL.id, true);
                    //             break;

                    //         case "twitch_vod":
                    //             this.loadVideoTW(StreamURL.id, false);
                    //             break;

                    //         case "twitcast":
                    //             this.setupIframeTC(StreamURL.id, StreamURL.id, true);
                    //             break;

                    //         case "twitcast_vod":
                    //             this.setupIframeTC(StreamURL.id, StreamURL.channel.name, false);
                    //             break;

                    //         case "niconico":
                    //             // niconico doesn't allow third party player hosting... at least for now...
                    //             // this.setupIframeNC(StreamURL.id, true);
                    //             break;

                    //         case "niconico_vod":
                    //             this.setupIframeNC(StreamURL.id, false);
                    //             break;

                    //         case "bilibili":
                    //             // bilibili live player is flash -> the one in FLASH link in the share button
                    //             // https://s1.hdslb.com/bfs/static/blive/live-assets/player/flash/pageplayer-latest.swf?room_id=0&cid=xxxxxx&state=LIVE
                    //             break;

                    //         case "bilibili_vod":
                    //             this.setupIframeBL(StreamURL.id);
                    //             break;

                    //         default:
                    //             this.loadVideoYT(StreamURL.id);
                    //             break;
                    //     }
                    // }
                }
            }, 1000);
        },
        unloadVideo() {
            this.vidPlayer = false;
            if (this.timerActive) {
                this.timerActive = false;
            }

            if (this.vidIframeEle) {
                window.removeEventListener("message", (e: any) => {
                    this.iframeVideoListener(e);
                });
            }

            if (
                (this.vidType === "twitch" || this.vidType === "twitch_vod")
                && window.Twitch
            ) {
                this.player.removeEventListener(window.Twitch.Player.PAUSE, () => {
                    this.pauseTracker = true;
                });

                this.player.removeEventListener(window.Twitch.Player.PLAY, () => {
                    this.pauseTracker = false;
                });

                this.player.removeEventListener(window.Twitch.Player.SEEK, (e: any) => {
                    this.timerTime = e.position * 1000;
                    this.scrollCalculator();
                });
            }
        },
        setupIframeTC(MID: string, UID: string, Live: boolean): void {
            if (this.vidIframeEle) {
                this.vidIframeEle.parentNode?.removeChild(this.vidIframeEle);
            }
            this.vidIframeEle = document.createElement("iframe");
            if (Live) {
                this.vidIframeEle.src = `https://twitcasting.tv/${UID}/embeddedplayer/live?auto_play=false&default_mute=false`;
                this.vidIframeEle.loading = "lazy";
            } else {
                this.vidIframeEle.src = `https://twitcasting.tv/${UID}/embeddedplayer/${MID}?auto_play=false&default_mute=false`;
            }
            this.vidIframeEle.width = "100%";
            this.vidIframeEle.height = "100%";
            this.vidIframeEle.frameBorder = "0";

            this.loadIframe("TC");
        },
        setupIframeBL(VID: string): void {
            let embedID = "";
            if (this.vidIframeEle) {
                this.vidIframeEle.parentNode?.removeChild(this.vidIframeEle);
            }

            switch (VID.slice(0, 2).toLowerCase()) {
                case "bv":
                    embedID = `bvid=${VID.slice(2)}`;
                    break;

                case "av":
                    embedID = `aid=${VID.slice(2)}`;
                    break;

                default:
                    embedID = `cid=${VID}`;
                    break;
            }

            this.vidIframeEle = document.createElement("iframe");
            this.vidIframeEle.src = `https://player.bilibili.com/player.html?${embedID}&page=1&as_wide=1&high_quality=0&danmaku=0`;
            this.vidIframeEle.width = "100%";
            this.vidIframeEle.height = "100%";
            this.vidIframeEle.frameBorder = "0";

            this.loadIframe("BL");
        },
        setupIframeNC(VID: string, Live: boolean): void {
            if (this.vidIframeEle) {
                this.vidIframeEle.parentNode?.removeChild(this.vidIframeEle);
            }

            this.vidIframeEle = document.createElement("iframe");
            if (Live) {
                this.vidIframeEle.src = `https://live.nicovideo.jp/embed/${VID}`;
            } else {
                this.vidIframeEle.src = `https://embed.nicovideo.jp/watch/${VID}?autoplay=0`;
            }
            this.vidIframeEle.width = "100%";
            this.vidIframeEle.height = "100%";
            this.vidIframeEle.frameBorder = "0";
            this.vidIframeEle.allow = "encrypted-media;";

            this.loadIframe("NC");
        },

        // -----------------  IFRAME  -----------------
        timePing(timestamp: number): void {
            if (this.vidIframeEle?.contentWindow) {
                this.vidIframeEle?.contentWindow.postMessage(
                    {
                        n: "HolodexSync",
                        d: timestamp,
                    },
                    this.IFOrigin,
                );
            }
        },
        modePing(Mode: string): void {
            switch (Mode) {
                case "TC":
                    this.IFOrigin = "https://twitcasting.tv";
                    break;

                case "NC":
                    this.IFOrigin = "https://embed.nicovideo.jp";
                    break;

                case "BL":
                    this.IFOrigin = "https://player.bilibili.com";
                    break;

                default:
                    this.IFOrigin = "";
                    break;
            }

            if (this.vidIframeEle?.contentWindow) {
                this.vidIframeEle?.contentWindow.postMessage(
                    {
                        n: "HolodexSync",
                        d: Mode,
                    },
                    this.IFOrigin,
                );
            }
        },
        startPing(): void {
            if (this.vidIframeEle?.contentWindow) {
                this.vidIframeEle?.contentWindow.postMessage(
                    {
                        n: "HolodexSync",
                        d: "s",
                    },
                    this.IFOrigin,
                );
            }
        },
        pausePing(): void {
            if (this.vidIframeEle?.contentWindow) {
                this.vidIframeEle?.contentWindow.postMessage(
                    {
                        n: "HolodexSync",
                        d: "p",
                    },
                    this.IFOrigin,
                );
            }
        },
        switchPing(): void {
            if (this.vidIframeEle?.contentWindow) {
                this.vidIframeEle?.contentWindow.postMessage(
                    {
                        n: "HolodexSync",
                        d: "w",
                    },
                    this.IFOrigin,
                );
            }
        },
        loadIframe(Mode: string): void {
            if (this.vidIframeEle) {
                const PlayerDiv = document.getElementById("player");
                if (PlayerDiv) {
                    PlayerDiv.append(this.vidIframeEle);

                    this.vidIframeEle.onload = () => {
                        this.modePing(Mode);
                    };

                    window.addEventListener("message", (e: any) => {
                        this.iframeVideoListener(e);
                    });
                }
            }
        },
        iframeVideoListener(e: any): void {
            if (e.origin === this.IFOrigin) {
                if (e.data.n === "SyncHolodex") {
                    if (typeof e.data.d === "number") {
                        this.timerTime = e.data.d;
                        this.scrollCalculator();
                    }
                }
            }
        },
        //= ================  IFRAME  =================

        // -----------------  YT  -----------------
        loadVideoYT(VID: string) {
            if (window.YT) {
                this.startVideoYT(VID);
                return;
            }

            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            if (firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = () => this.startVideoYT(VID);
        },
        startVideoYT(VID: string) {
            this.player = new window.YT.Player("player", {
                videoId: VID,
                playerVars: {
                    playsinline: 1,
                },
                events: {
                    onReady: this.readyStateYT.bind(this),
                },
            });
        },
        readyStateYT() {
            this.startTrackerYT();
        },
        startTrackerYT(): void {
            this.timerMode = 1;
            this.refreshRate = 100;
            if (!this.timerActive) {
                this.timerActive = true;
                this.proceedTimer(Date.now());
            }
        },
        //= ================  YT  =================

        // -----------------  TW  -----------------
        loadVideoTW(VID: string, Live: boolean) {
            this.startTWTracker();
            if (window.Twitch) {
                this.startVideoTW(VID, Live);
                return;
            }

            const tag = document.createElement("script");
            tag.src = "https://player.twitch.tv/js/embed/v1.js";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            if (firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            const Checker = setInterval(() => {
                if (window.Twitch) {
                    clearInterval(Checker);
                    this.startVideoTW(VID, Live);
                }
            }, 1000);
        },
        startVideoTW(VID: string, Live: boolean) {
            if (Live) {
                this.player = new window.Twitch.Player("player", {
                    width: "100%",
                    height: "100%",
                    channel: VID,
                    autoplay: false,
                    time: "0h0m0s",
                });
            } else {
                this.player = new window.Twitch.Player("player", {
                    width: "100%",
                    height: "100%",
                    video: VID,
                    autoplay: false,
                    time: "0h0m0s",
                });
            }

            this.player.addEventListener(window.Twitch.Player.PAUSE, () => {
                // this.trackerPause = true;
            });

            this.player.addEventListener(window.Twitch.Player.PLAY, () => {
                // this.trackerPause = false;
            });

            this.player.addEventListener(window.Twitch.Player.SEEK, (e: any) => {
                this.timerTime = e.position * 1000;
                this.scrollCalculator();
            });
        },
        startTWTracker() {
            this.timerMode = 0;
            this.refreshRate = this.defaultRefreshRate;
            if (!this.timerActive) {
                this.timerActive = true;
                this.proceedTimer(Date.now());
            }
        },
        //= ================  TW  =================

        //= ====================== VIDEO CONTROLLER ======================

        //= =----------------------- ENTRY CONTROLLER ------------------------
        deleteEntry() {
            const tempEntries = JSON.parse(
                JSON.stringify(this.entries[this.selectedEntry]),
            );
            this.displayEntry = -1;
            this.timecardIdx = [];
            this.entries.splice(this.selectedEntry, 1);
            this.reloadDisplayCards();
            this.selectedEntry = -1;

            let checkNew = this.transactionLog.filter((e) => e.id === tempEntries.id);
            if (checkNew.length === 0) {
                this.transactionLog.push({
                    type: "Delete",
                    id: tempEntries.id,
                });
            } else {
                checkNew = checkNew.filter((e) => e.type === "Change");
                if (checkNew.length === 0) {
                    this.transactionLog = this.transactionLog.filter(
                        (e) => e.id !== tempEntries.id,
                    );
                } else {
                    this.transactionLog = this.transactionLog.filter(
                        (e) => e.id !== tempEntries.id,
                    );
                    this.transactionLog.push({
                        type: "Delete",
                        id: tempEntries.id,
                    });
                }
            }
        },
        setStartEntry() {
            this.timecardIdx = [];
            this.displayEntry = -1;
            for (let idx = 0; idx < this.selectedEntry; idx += 1) {
                this.transactionLog.push({
                    type: "Delete",
                    id: idx,
                });
            }
            this.entries.splice(0, this.selectedEntry);
            this.selectedEntry = -1;
            const timeCut = this.entries[0].Time;
            this.entries = this.entries.map((e) => {
                this.logChange(e.id);
                e.Time -= timeCut;
                return e;
            });
            this.reloadDisplayCards();
        },
        //= ======================== ENTRY CONTROLLER ========================

        //= ------------------------ TIMELINE CONTROLLER ------------------------
        cardFiller(index) {
            if (index === 0) {
                if (
                    this.entries[this.timecardIdx[index]].Time / 1000
                    < this.secPerBar * this.barCount
                ) {
                    return 0;
                }
                return (
                    (this.entries[this.timecardIdx[index]].Time / 1000
                        - this.secPerBar * this.barCount)
                    * this.secToPx
                );
            }
            return (
                ((this.entries[this.timecardIdx[index]].Time
                    - this.entries[this.timecardIdx[index - 1]].Time
                    - this.entries[this.timecardIdx[index - 1]].Duration)
                    / 1000)
                * this.secToPx
            );
        },
        cardWidth(index) {
            if (
                index === 0
                && this.entries[this.timecardIdx[index]].Time / 1000
                    < this.secPerBar * this.barCount
            ) {
                return (
                    ((this.entries[this.timecardIdx[index]].Duration
                        + this.entries[this.timecardIdx[index]].Time)
                        / 1000
                        - this.secPerBar * this.barCount)
                    * this.secToPx
                );
            }
            if (
                index === this.timecardIdx.length - 1
                && (this.entries[this.timecardIdx[index]].Duration
                    + this.entries[this.timecardIdx[index]].Time)
                    / 1000
                    > this.secPerBar * (this.barCount + 3)
            ) {
                return (
                    (this.secPerBar * (this.barCount + 3)
                        - this.entries[this.timecardIdx[index]].Time / 1000)
                    * this.secToPx
                );
            }
            return (
                (this.entries[this.timecardIdx[index]].Duration / 1000) * this.secToPx
            );
        },
        secToTimeString(
            secInput: number,
            msOutput: boolean = true,
            Full: boolean = false,
        ): string {
            let Sec = secInput;
            let MS: string = Math.floor((Sec % 1) * 100).toString();
            if (MS.length === 1) {
                MS = `0${MS}`;
            }

            Sec = Math.floor(Sec);
            const H: number = Math.floor(Sec / 60 / 60);
            Sec -= H * 60 * 60;
            const M: number = Math.floor(Sec / 60);
            Sec -= M * 60;

            let Stemp: string = H.toString();
            if (Stemp.length === 1) {
                Stemp = `0${Stemp}`;
            }
            Stemp = `${Stemp}:${`0${M.toString()}`.slice(
                -2,
            )}:${`0${Sec.toString()}`.slice(-2)}.${MS}`;

            if (Full) {
                if (msOutput) {
                    return Stemp;
                }
                return Stemp.slice(0, Stemp.length - 3);
            }
            for (let i = 0; i < 3; i += 1) {
                if (Stemp.slice(0, 2) !== "00") {
                    break;
                } else {
                    Stemp = Stemp.slice(3);
                }
            }

            if (Stemp[0] === "0") {
                Stemp = Stemp.slice(1);
            }

            if (msOutput) {
                return Stemp;
            }
            return Stemp.slice(0, Stemp.length - 3);
        },
        scrollCalculator(): void {
            const deltaBar: number = this.timerTime / 1000 / this.secPerBar - this.barCount;
            if (deltaBar > 3 || deltaBar < 0) {
                const barCountNew = Math.floor(this.timerTime / 1000 / this.secPerBar);
                if (barCountNew > 0) {
                    this.barCount = barCountNew - 1;
                } else {
                    this.barCount = 0;
                }
                this.rerenderTimeline();
                this.reloadDisplayCards();
            } else if (deltaBar > 2) {
                this.barCount += 1;
                this.renderForward();
                this.reloadDisplayCards();
            } else if (deltaBar < 1 && this.barCount > 0) {
                this.barCount -= 1;
                this.renderBackward();
                this.reloadDisplayCards();
            }

            this.$refs.TimelineDiv.scrollLeft = (this.timerTime / 1000 - this.barCount * this.secPerBar) * this.secToPx;
        },
        renderCtx(ctx: CanvasRenderingContext2D, idx: number) {
            ctx.save();
            ctx.strokeStyle = "white";
            ctx.fillStyle = "white";
            ctx.font = "14px Ubuntu";
            ctx.lineWidth = 0.35;

            if (this.secToPx <= 60) {
                for (let x = 0; x / 10 < this.secPerBar; x += 10) {
                    ctx.beginPath();
                    ctx.moveTo((x * this.secToPx) / 10, 0);
                    ctx.lineTo((x * this.secToPx) / 10, this.barHeight);
                    ctx.stroke();

                    ctx.fillText(
                        this.secToTimeString(
                            x / 10 + idx * this.secPerBar + this.barCount * this.secPerBar,
                            false,
                            false,
                        ),
                        (x * this.secToPx) / 10 + 5,
                        this.barHeight,
                    );
                }

                ctx.restore();
            } else if (this.secToPx <= 100) {
                for (let x = 0; x / 10 < this.secPerBar; x += 2) {
                    if (x % 10 === 0) {
                        ctx.beginPath();
                        ctx.moveTo((x * this.secToPx) / 10, 0);
                        ctx.lineTo((x * this.secToPx) / 10, this.barHeight);
                        ctx.stroke();

                        ctx.fillText(
                            this.secToTimeString(
                                x / 10 + idx * this.secPerBar + this.barCount * this.secPerBar,
                                false,
                                false,
                            ),
                            (x * this.secToPx) / 10 + 5,
                            this.barHeight,
                        );
                    } else {
                        ctx.beginPath();
                        ctx.moveTo((x * this.secToPx) / 10, 0);
                        ctx.lineTo((x * this.secToPx) / 10, (this.barHeight * 2.0) / 5.0);
                        ctx.stroke();
                    }
                }

                ctx.restore();
            } else {
                for (let x = 0; x / 10 < this.secPerBar; x += 1) {
                    if (x % 10 === 0) {
                        ctx.beginPath();
                        ctx.moveTo((x * this.secToPx) / 10, 0);
                        ctx.lineTo((x * this.secToPx) / 10, this.barHeight);
                        ctx.stroke();

                        ctx.fillText(
                            this.secToTimeString(
                                x / 10 + idx * this.secPerBar + this.barCount * this.secPerBar,
                                false,
                                false,
                            ),
                            (x * this.secToPx) / 10 + 5,
                            this.barHeight,
                        );
                    } else if (x % 2 === 0) {
                        ctx.beginPath();
                        ctx.moveTo((x * this.secToPx) / 10, 0);
                        ctx.lineTo((x * this.secToPx) / 10, (this.barHeight * 2.0) / 5.0);
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.moveTo((x * this.secToPx) / 10, 0);
                        ctx.lineTo((x * this.secToPx) / 10, (this.barHeight * 2.0) / 5.0);
                        ctx.stroke();
                    }
                }

                ctx.restore();
            }
        },
        rerenderTimeline() {
            if (this.$refs.TimeCanvas1) {
                let ctx: CanvasRenderingContext2D | null = null;
                for (let i = 0; i < 3; i += 1) {
                    switch (i) {
                        case 0:
                            ctx = this.$refs.TimeCanvas1.getContext("2d");
                            this.$refs.TimeCanvas1.width = this.secToPx * this.secPerBar;
                            this.$refs.TimeCanvas1.height = this.barHeight;
                            break;

                        case 1:
                            ctx = this.$refs.TimeCanvas2.getContext("2d");
                            this.$refs.TimeCanvas2.width = this.secToPx * this.secPerBar;
                            this.$refs.TimeCanvas2.height = this.barHeight;
                            break;

                        case 2:
                            ctx = this.$refs.TimeCanvas3.getContext("2d");
                            this.$refs.TimeCanvas3.width = this.secToPx * this.secPerBar;
                            this.$refs.TimeCanvas3.height = this.barHeight;
                            break;

                        default:
                            ctx = null;
                            break;
                    }

                    if (ctx) {
                        this.renderCtx(ctx, i);
                    }
                }
            }
        },
        renderForward(): void {
            let ctx = this.$refs.TimeCanvas1.getContext("2d");
            if (ctx) {
                this.$refs.TimeCanvas1.width = this.secToPx * this.secPerBar;
                this.$refs.TimeCanvas1.height = this.barHeight;
                ctx.drawImage(this.$refs.TimeCanvas2, 0, 0);
            }

            ctx = this.$refs.TimeCanvas2.getContext("2d");
            if (ctx) {
                this.$refs.TimeCanvas2.width = this.secToPx * this.secPerBar;
                this.$refs.TimeCanvas2.height = this.barHeight;
                ctx.drawImage(this.$refs.TimeCanvas3, 0, 0);
            }

            ctx = this.$refs.TimeCanvas3.getContext("2d");
            this.$refs.TimeCanvas3.width = this.secToPx * this.secPerBar;
            this.$refs.TimeCanvas3.height = this.barHeight;

            if (ctx) {
                this.renderCtx(ctx, 2);
            }
        },
        renderBackward(): void {
            let ctx = this.$refs.TimeCanvas3.getContext("2d");
            if (ctx) {
                this.$refs.TimeCanvas3.width = this.secToPx * this.secPerBar;
                this.$refs.TimeCanvas3.height = this.barHeight;
                ctx.drawImage(this.$refs.TimeCanvas2, 0, 0);
            }

            ctx = this.$refs.TimeCanvas2.getContext("2d");
            if (ctx) {
                this.$refs.TimeCanvas2.width = this.secToPx * this.secPerBar;
                this.$refs.TimeCanvas2.height = this.barHeight;
                ctx.drawImage(this.$refs.TimeCanvas1, 0, 0);
            }

            ctx = this.$refs.TimeCanvas1.getContext("2d");
            this.$refs.TimeCanvas1.width = this.secToPx * this.secPerBar;
            this.$refs.TimeCanvas1.height = this.barHeight;

            if (ctx) {
                this.renderCtx(ctx, 0);
            }
        },
        reloadDisplayCards(): void {
            this.timecardIdx = [];
            for (let i = 0; i < this.entries.length; i += 1) {
                if (
                    this.entries[i].Time + this.entries[i].Duration
                    > (this.barCount + 3.0) * this.secPerBar * 1000
                ) {
                    if (
                        this.entries[i].Time
                        < (this.barCount + 3.0) * this.secPerBar * 1000
                    ) {
                        this.timecardIdx.push(i);
                    }
                    break;
                } else if (
                    this.entries[i].Time + this.entries[i].Duration
                    > this.barCount * this.secPerBar * 1000
                ) {
                    if (this.entries[i].Time >= this.barCount * this.secPerBar * 1000) {
                        this.timecardIdx.push(i);
                    } else {
                        this.timecardIdx.push(i);
                    }
                }
            }
        },
        rulerMouseLeave() {
            if (this.timelineActive) {
                this.logChange(this.entries[this.selectedEntry].id);
            }
            this.timelineActive = false;
        },
        rulerMouseDown(event: any, idx: number, resizeSwitch: number) {
            if (!this.timelineActive) {
                this.selectedEntry = idx;
                this.timelineActive = true;
                this.xPos = event.clientX;
                this.resizeMode = resizeSwitch;
            }
        },
        rulerMouseUp() {
            if (this.timelineActive) {
                this.logChange(this.entries[this.selectedEntry].id);
            }
            this.timelineActive = false;
        },
        rulerMouseMove(event: any) {
            if (this.timelineActive) {
                switch (this.resizeMode) {
                    case 0: {
                        const xChange = ((event.clientX - this.xPos) / this.secToPx) * 1000;
                        if (this.entries[this.selectedEntry].Duration - xChange < 300) {
                            this.timelineActive = false;
                            return;
                        }

                        if (
                            this.entries[this.selectedEntry].Time + xChange
                            < this.secPerBar * this.barCount * 1000
                        ) {
                            this.timelineActive = false;
                            return;
                        }

                        if (this.selectedEntry > 0) {
                            if (
                                this.entries[this.selectedEntry].Time + xChange
                                < this.entries[this.selectedEntry - 1].Time
                                + this.entries[this.selectedEntry - 1].Duration
                            ) {
                                if (
                                    this.entries[this.selectedEntry - 1].Duration + xChange
                                    > 300
                                ) {
                                    this.entries[this.selectedEntry - 1].Duration = this.entries[this.selectedEntry - 1].Duration + xChange;
                                } else {
                                    this.timelineActive = false;
                                    return;
                                }
                            }
                        }

                        this.entries[this.selectedEntry].Duration -= xChange;
                        this.entries[this.selectedEntry].Time += xChange;
                        break;
                    }

                    case 1: {
                        const xChange = ((event.clientX - this.xPos) / this.secToPx) * 1000;
                        if (this.entries[this.selectedEntry].Duration - xChange < 300) {
                            this.timelineActive = false;
                            return;
                        }

                        if (this.selectedEntry > 0) {
                            if (
                                this.entries[this.selectedEntry].Time + xChange
                                < this.entries[this.selectedEntry - 1].Time
                                + this.entries[this.selectedEntry - 1].Duration
                            ) {
                                if (
                                    this.entries[this.selectedEntry - 1].Duration + xChange
                                    > 300
                                ) {
                                    this.entries[this.selectedEntry - 1].Duration = this.entries[this.selectedEntry - 1].Duration + xChange;
                                } else {
                                    this.timelineActive = false;
                                    return;
                                }
                            }
                        }

                        if (this.selectedEntry < this.entries.length - 1) {
                            if (
                                this.entries[this.selectedEntry].Time
                                + this.entries[this.selectedEntry].Duration
                                + xChange
                                > this.entries[this.selectedEntry + 1].Time
                            ) {
                                if (
                                    this.entries[this.selectedEntry + 1].Duration - xChange
                                    > 300
                                ) {
                                    this.entries[this.selectedEntry + 1].Duration = this.entries[this.selectedEntry + 1].Duration - xChange;
                                    this.entries[this.selectedEntry + 1].Time = this.entries[this.selectedEntry].Time
                                        + this.entries[this.selectedEntry].Duration
                                        + xChange;
                                } else {
                                    this.timelineActive = false;
                                    return;
                                }
                            }
                        }

                        if (this.entries[this.selectedEntry].Time + xChange > 0) {
                            this.entries[this.selectedEntry].Time += xChange;
                        } else {
                            this.entries[this.selectedEntry].Time = 0;
                        }
                        break;
                    }

                    case 2: {
                        const xChange = ((event.clientX - this.xPos) / this.secToPx) * 1000;
                        if (this.entries[this.selectedEntry].Duration + xChange < 300) {
                            this.timelineActive = false;
                            return;
                        }

                        if (this.selectedEntry < this.entries.length - 1) {
                            if (
                                this.entries[this.selectedEntry].Time
                                + this.entries[this.selectedEntry].Duration
                                + xChange
                                > this.entries[this.selectedEntry + 1].Time
                            ) {
                                if (
                                    this.entries[this.selectedEntry + 1].Duration - xChange
                                    > 300
                                ) {
                                    this.entries[this.selectedEntry + 1].Duration = this.entries[this.selectedEntry + 1].Duration - xChange;
                                    this.entries[this.selectedEntry + 1].Time = this.entries[this.selectedEntry].Time
                                        + this.entries[this.selectedEntry].Duration
                                        + xChange;
                                } else {
                                    this.timelineActive = false;
                                    return;
                                }
                            }
                        }

                        this.entries[this.selectedEntry].Duration += xChange;
                        break;
                    }

                    default:
                        break;
                }
                this.xPos = event.clientX;
            }
        },
        //= ======================== TIMELINE CONTROLLER ========================

        async checkLoginValidity() {
            const check = await backendApi.loginIsValid(this.userdata.jwt);
            if (check === false) {
                this.$store.dispatch("logout");
                this.$router.push("/login");
            } else if (check.data && check.data.id) {
                this.$store.commit("setUser", {
                    user: check.data,
                    jwt: this.userdata.jwt,
                });
            }
        },
        modalNexusOutsideClick() {
            if (this.modalMode !== 5) {
                this.modalNexus = false;
            }
        },
        processImportData(eventData) {
            const data = eventData;
            this.displayEntry = -1;
            this.timecardIdx = [];
            this.selectedEntry = -1;

            for (; this.entries.length > 0;) {
                const tempEntries = this.entries.splice(0, 1)[0];
                let checkNew = this.transactionLog.filter(
                    (e) => e.id === tempEntries.id,
                );
                if (checkNew.length === 0) {
                    this.transactionLog.push({
                        type: "Delete",
                        id: tempEntries.id,
                    });
                } else {
                    checkNew = checkNew.filter((e) => e.type === "Change");
                    if (checkNew.length === 0) {
                        this.transactionLog = this.transactionLog.filter(
                            (e) => e.id !== tempEntries.id,
                        );
                    } else {
                        this.transactionLog = this.transactionLog.filter(
                            (e) => e.id !== tempEntries.id,
                        );
                        this.transactionLog.push({
                            type: "Delete",
                            id: tempEntries.id,
                        });
                    }
                }
            }

            this.profile = [
                {
                    Name: "Default",
                    Prefix: "",
                    Suffix: "",
                    useCC: false,
                    CC: "#000000",
                    useOC: false,
                    OC: "#000000",
                },
            ];

            for (let i = 1; data.profileData.length > 0; i += 1) {
                const dt = data.profileData.splice(0, 1)[0];
                dt.Name = `Profile${i.toString()}`;
                this.profile.push(dt);
            }

            for (let i = 0; data.entriesData.length > 0; i += 1) {
                const dt = data.entriesData.splice(0, 1)[0];
                dt.id = `I${i.toString()}`;
                dt.Profile += 1;
                this.entries.push(dt);
                this.transactionLog.push({
                    type: "Add",
                    id: dt.id,
                });
            }

            this.processLog(false);
            this.reloadDisplayCards();
        },
        changeUsernameClick() {
            this.$router.push({ path: "/login" });
        },
        async settingOKClick() {
            if (!this.activeURLStream) return;
            this.activeURLInput = this.activeURLStream;
            let vidData: any = {
                id: "custom",
                custom_video_id: this.activeURLStream,
                start_actual: null,
                status: null,
                title: this.activeURLStream,
            };
            this.videoData = vidData;
            try {
                const parseVideoID = this.activeURLStream.match(VIDEO_URL_REGEX)?.[5];
                if (parseVideoID) {
                    vidData = (await backendApi.video(parseVideoID, this.TLLang.value))
                        .data;
                    if (vidData) {
                        this.videoData = {
                            id: parseVideoID,
                            status: vidData.status,
                            start_actual: !vidData.start_actual
                                ? Date.parse(vidData.available_at)
                                : Date.parse(vidData.start_actual),
                            title: vidData.title,
                        };
                    }
                }
            } catch (e) {
                console.error(e);
            }

            this.timecardIdx = [];
            this.entries = [];
            let fetchChat = (
                await backendApi.chatHistory(vidData.id, {
                    lang: this.TLLang.value,
                    verified: 0,
                    moderator: 0,
                    vtuber: 0,
                    limit: 100000,
                    mode: 1,
                    creator_id: this.userdata.user.id,
                    ...(vidData.id === "custom" && {
                        custom_video_id: this.activeURLStream,
                    }),
                })
            ).data;

            fetchChat = fetchChat
                .filter(
                    (e) => !this.videoData?.start_actual
                        || e.timestamp >= this.videoData?.start_actual,
                )
                .map((e) => {
                    const timestampShifted = e.timestamp
                        - (this.videoData?.start_actual || fetchChat[0].timestamp || 0);
                    return { ...e, timestampShifted };
                });

            for (let i = 0; i < fetchChat.length; i += 1) {
                const dt = {
                    id: fetchChat[i].id,
                    Time: fetchChat[i].timestampShifted,
                    realTime: fetchChat[i].timestamp,
                    SText: fetchChat[i].message,
                    Profile: 0,
                };

                if (fetchChat[i].duration) {
                    this.entries.push({
                        ...dt,
                        Duration: Number(fetchChat[i].duration),
                    });
                } else if (i === fetchChat.length - 1) {
                    this.entries.push({
                        ...dt,
                        Duration: 3000,
                    });
                } else {
                    this.entries.push({
                        ...dt,
                        Duration: fetchChat[i + 1].timestamp - fetchChat[i].timestamp,
                    });
                }

                if (i === fetchChat.length - 1) {
                    this.reloadDisplayCards();
                }
            }

            if (this.vidPlayer) {
                this.unloadVideo();
                setTimeout(() => {
                    this.loadVideo();
                }, 1000);
            } else {
                this.loadVideo();
            }

            this.modalNexus = false;
        },
        shiftTime() {
            const offset = Number.parseFloat(this.offsetInput);
            if (Number.isNaN(offset)) {
                alert("Invalid offset");
                return;
            }
            this.entries = this.entries.map((e) => ({
                ...e,
                Time: Math.max(e.Time + offset * 1000, 0),
                realTime: Math.max(Number.parseFloat(e.realTime) + offset * 1000, 0),
            }));
            this.entries.forEach((e) => this.logChange(e.id));
            this.offsetInput = 0;
        },
    },
};
</script>

<style>
.tl-topbar > *:not(:first-child):not(:last-child) {
  margin: 0px 3px;
}
.tl-topbar > * {
  border-radius: 0px;
  text-transform: unset !important;
}
.TopMenu {
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1;
}
.ColourButton {
  margin-top: 19px;
  margin-left: 5px;
}
.ProfileListCard {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
.ChatPanelContainer {
  display: grid;
  grid-auto-flow: column;
}
.ControlBox {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
}
.Marker {
  position: absolute;
  left: calc(40% - 2px);
  top: 0px;
  width: 4px;
  height: 100%;
  z-index: 1;
  background-color: rgba(255, 0, 0, 0.7);
}
.TimelineContainer {
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  border-top: 2px solid white;
  padding-top: 7px;
  border-bottom: 2px solid white;
}
.TimelineInnerContainer.v-sheet.v-card {
  display: flex;
  flex-direction: row;
  margin-left: 40%;
  margin-bottom: 10px;
}
.Timecard.v-sheet.v-card {
  border: 2px solid white;
}
.TimecardText {
  width: 100%;
  cursor: grab;
  max-height: 3em;
}
</style>
