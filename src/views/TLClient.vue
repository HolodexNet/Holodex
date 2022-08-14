<template>
  <v-container fill-height fluid style="max-height: 100vh; padding: 0px 12px">
    <div class="d-flex flex-column" style="height: 100%; width: 100%">
      <v-system-bar height="30" class="tl-topbar px-0" color="secondary">
        <v-btn small outlined to="/">
          <v-icon>{{ icons.mdiHome }}</v-icon>
          {{ $t("component.mainNav.home") }}
        </v-btn>
        <v-btn
          small
          outlined
          @click="
            modalMode = 3;
            modalNexus = true;
          "
        >
          {{ $t("views.tlClient.menu.setting") }}
        </v-btn>
        <v-btn
          small
          outlined
          :to="`/scripteditor?video=${
            video.id ? `YT_${video.id}` : mainStreamLink
          }`"
        >
          {{ $t("component.videoCard.openScriptEditor") }}
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="!vidPlayer"
          small
          outlined
          @click="loadVideo()"
        >
          {{ $t("views.tlClient.menu.loadVideo") }}
        </v-btn>
        <v-btn
          v-if="vidPlayer"
          small
          outlined
          @click="unloadVideo()"
        >
          {{ $t("views.tlClient.menu.unloadVideo") }}
        </v-btn>
        <v-spacer />

        <v-btn
          small
          outlined
          @click="
            modalMode = 4;
            modalNexus = true;
            activeURLStream = '';
          "
        >
          {{ $t("views.tlClient.menu.loadChat") }}
        </v-btn>
        <v-btn
          small
          outlined
          @click="
            modalMode = 5;
            modalNexus = true;
          "
        >
          {{ $t("views.tlClient.menu.unloadChat") }}
        </v-btn>
      </v-system-bar>
      <div
        class="d-flex align-stretch flex-row"
        style="height: 100%"
        @click="menuBool = false"
        @mousemove="resizeMouseMove($event)"
        @mouseleave="resizeMouseLeave(1)"
        @mouseup="resizeMouseUp()"
      >
        <v-card
          class="d-flex flex-column flex-grow-1"
          height="100%;"
          :width="
            activeChat.length < 2
              ? videoPanelWidth1 + '%'
              : videoPanelWidth2 + '%'
          "
          @mouseleave="resizeMouseLeave(0)"
        >
          <div
            v-if="resizeActive"
            style="
              position: absolute;
              height: 100%;
              width: 100%;
              background-color: transparent;
              z-index: 1;
            "
          />
          <v-card
            v-if="vidPlayer && getVideoIDFromUrl(mainStreamLink)"
            style="height: 100%"
            class="d-flex flex-column"
            outlined
          >
            <v-card id="player" height="100%" width="100%">
              <youtube-player
                v-if="getVideoIDFromUrl(mainStreamLink).type !== 'twitch'"
                :video-id="getVideoIDFromUrl(mainStreamLink).id"
              />
              <twitch-player
                v-else
                :channel="getVideoIDFromUrl(mainStreamLink).id"
                style="width: 100%; height: 100%"
              />
            </v-card>
          </v-card>
          <div
            v-if="vidPlayer"
            style="
              cursor: s-resize;
              height: 8px;
              background: var(--v-background-base);
            "
            @mousedown="resizeMouseDown($event, 0)"
          >
            <div
              style="
                width: 10%;
                min-width: 40px;
                margin-left: auto;
                margin-right: auto;
                background: #444;
                height: 3px;
                border-radius: 2px;
                margin-top: 1px;
              "
            />
          </div>
          <LiveTranslations
            v-if="!isLoading"
            :tl-lang="TLLang.value"
            :tl-client="true"
            :video="
              mainLinkIsCustom
                ? { id: 'custom', custom_video_id: mainStreamLink }
                : video
            "
            :class="{
              'stick-bottom': $store.state.settings.liveTlStickBottom,
              'tl-full-height': false,
            }"
            :style="{ height: vidPlayer ? tlChatHeight + 'px' : '100%' }"
            :use-local-subtitle-toggle="false"
          />
          <v-card
            v-if="profileDisplay && activeChat.length > 1"
            class="ProfileListCard d-flex flex-column"
          >
            <span
              v-for="(prf, index) in profile"
              :key="index"
            ><span v-if="index === profileIdx">> </span>{{ index + 1 + ". " + prf.Name }}</span>
          </v-card>
        </v-card>
        <div
          v-if="activeChat.length > 0"
          style="cursor: e-resize; width: 7px"
          @mousedown="resizeMouseDown($event, 1)"
        >
          <div
            style="
              height: 10%;
              min-height: 40px;
              margin-top: 40vh;
              margin-bottom: auto;
              background: #444;
              width: 3px;
              border-radius: 2px;
              margin-left: 2px;
            "
          />
        </div>
        <v-card
          v-if="activeChat.length > 0"
          class="ChatPanelContainer"
          height="100%"
          :width="
            activeChat.length < 2
              ? 100 - videoPanelWidth1 + '%'
              : 100 - videoPanelWidth2 + '%'
          "
          :style="activeChatGridRow"
          outlined
        >
          <div
            v-if="resizeActive"
            style="
              position: absolute;
              height: 100%;
              width: 100%;
              background-color: transparent;
              z-index: 1;
            "
          />
          <v-card
            v-for="(ChatURL, index) in activeChat"
            :key="ChatURL.text"
            class="d-flex flex-column"
            outlined
          >
            <p class="text-center" style="margin-top: 5px">
              {{ ChatURL.text }}
              <v-icon class="float-right" @click="closeActiveChat(index)">
                {{ mdiCloseCircle }}
              </v-icon>
            </p>
            <iframe
              class="activeChatIFrame"
              :src="URLExtender(ChatURL.text)"
              frameborder="0"
              @load="IFrameLoaded($event, ChatURL.text)"
            />
          </v-card>
          <v-card
            v-if="profileDisplay && activeChat.length < 2"
            class="ProfileListCard d-flex flex-column"
          >
            <span
              v-for="(prf, index) in profile"
              :key="'profilecard' + index"
            ><span v-if="index === profileIdx">> </span>
              <kbd v-if="index > 0">Ctrl-{{ index }}</kbd>
              <kbd v-if="index == 0">Ctrl-{{ index }} | Shift⇧-Tab↹</kbd>
              {{ " " + prf.Name }}
            </span>
          </v-card>
        </v-card>
      </div>

      <v-container
        @keydown.up.exact="profileUp()"
        @keydown.down.exact="profileDown(false)"
        @keydown.tab.exact.prevent="profileDown(true)"
        @keydown.shift.tab.exact.prevent="profileJumpToDefault()"
        @keydown.ctrl.48.exact.prevent="profileJump(0)"
        @keydown.ctrl.49.exact.prevent="profileJump(1)"
        @keydown.ctrl.50.exact.prevent="profileJump(2)"
        @keydown.ctrl.51.exact.prevent="profileJump(3)"
        @keydown.ctrl.52.exact.prevent="profileJump(4)"
        @keydown.ctrl.53.exact.prevent="profileJump(5)"
        @keydown.ctrl.54.exact.prevent="profileJump(6)"
        @keydown.ctrl.55.exact.prevent="profileJump(7)"
        @keydown.ctrl.56.exact.prevent="profileJump(8)"
        @keydown.ctrl.59.exact.prevent="profileJump(9)"
      >
        <v-row>
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
                <span>
                  <kbd>Up⇧</kbd> or <kbd>Down⇩</kbd> to change Profiles </span><br>
                <span>
                  <kbd>Ctrl+[0~9]</kbd> to quick switch to Profile 0-9 </span><br>
                <span>
                  <kbd>Tab↹</kbd> to quick switch between Profiles 1-9 (0 is
                  special) </span><br>
                <span>
                  <kbd>Shift⇧-Tab↹</kbd> to quick switch to Profile 0
                </span>
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
              <v-spacer />
              <v-text-field
                v-model="localPrefix"
                :label="$t('views.tlClient.tlControl.localPrefix')"
                dense
                outlined
                hide-details
              />
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
                {{ $t("views.tlClient.tlControl.removeProfile") }} ({{
                  profile[profileIdx].Name
                }})
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
      3 Setting
      4 Load Chat
      5 Unload Chat ALL
    -->
    <v-dialog
      v-model="modalNexus"
      max-width="600px"
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

      <!---------    SETTING     --------->
      <v-card v-if="modalMode === 3">
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
          <div class="d-flex align-center">
            <v-text-field
              v-model="mainStreamLink"
              :label="$t('views.tlClient.settingPanel.mainStreamLink')"
              placeholder="https://..."
            />
            <span class="mx-2">or</span>
            <v-dialog v-model="videoSelectDialog">
              <template #activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  class="ml-2"
                  dark
                  v-bind="attrs"
                  v-on="on"
                >
                  Find Video
                </v-btn>
              </template>
              <video-selector @videoClicked="handleVideoClicked" />
            </v-dialog>
          </div>
          <v-card-title>
            {{ $t("views.tlClient.settingPanel.collabLink") }}
          </v-card-title>
          <v-text-field
            v-for="(AuxLink, index) in collabLinks"
            :key="index"
            v-model="collabLinks[index]"
            :append-outer-icon="mdiPlusCircle"
            :prepend-icon="mdiMinusCircle"
            style="margin-left: 17px"
            @click:prepend="deleteAuxLink(index)"
            @click:append-outer="collabLinks.push('')"
          />
          <v-card-actions class="d-flex flex-row justify-center">
            <v-btn @click="settingOKClick()">
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  LOAD ACTIVE CHAT ------->
      <v-card v-if="modalMode === 4">
        <v-container>
          <v-card-title>
            {{ $t("views.tlClient.loadChatPanel.title") }}
          </v-card-title>
          <v-text-field
            v-model="activeURLStream"
            :label="$t('views.tlClient.loadChatPanel.inputLabel')"
          />
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn
              style="margin-left: auto"
              @click="
                loadChat(activeURLStream);
                modalNexus = false;
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  UNLOAD ALL ACTIVE CHAT ------->
      <v-card v-if="modalMode === 5">
        <v-container>
          <v-card-title>
            {{ $t("views.tlClient.unloadChatTitle") }}
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn
              style="margin-left: auto"
              @click="
                unloadAll();
                modalNexus = false;
              "
            >
              {{ $t("views.tlClient.okBtn") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
    <!--========   NEXUS MODAL =======-->
    <v-snackbar
      v-if="errorMessage"
      v-model="showErrorAlert"
      color="error"
      dismissible
      absolute
      timeout="4000"
      bottom
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import LiveTranslations from "@/components/chat/LiveTranslations.vue";
import VideoSelector from "@/components/multiview/VideoSelector.vue";
import { TL_LANGS, VIDEO_URL_REGEX } from "@/utils/consts";
import {
    mdiPlusCircle,
    mdiMinusCircle,
    mdiCloseCircle,
    mdiKeyboard,
    mdiCog,
    mdiCogOff,
} from "@mdi/js";
import { getVideoIDFromUrl, videoCodeParser } from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import { mapState } from "vuex";
import YoutubePlayer from "@/components/player/YoutubePlayer.vue";
import TwitchPlayer from "@/components/player/TwitchPlayer.vue";

export default {
    name: "Tlclient",
    metaInfo() {
        return {
            get title() {
                return "TLClient - Holodex";
            },
        };
    },
    components: {
        LiveTranslations,
        VideoSelector,
        YoutubePlayer,
        TwitchPlayer,
    },
    data() {
        return {
            TL_LANGS,
            mdiPlusCircle,
            mdiMinusCircle,
            mdiCloseCircle,
            mdiCog,
            mdiKeyboard,
            mdiCogOff,
            TLSetting: true,
            firstLoad: true,
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
            localPrefix: `[${TL_LANGS[0].value}] `,
            // ------ COLOUR -------
            colourPick: 0,
            colourDialogue: false,
            colourTemp: "",
            // ------ MODAL --------
            modalNexus: true,
            modalMode: 3,
            addProfileNameString: "",
            // ------ SETTING ------
            TLLang: TL_LANGS[0],
            mainStreamLink: "",
            collabLinks: [""],
            videoSelectDialog: false,
            // ---- ACTIVE CHAT ----
            activeChat: [],
            activeURLStream: "",
            // ---- ACTIVE VIDEO ----
            activeURLInput: "",
            vidType: "",
            vidPlayer: false,
            vidIframeEle: null,
            player: null,
            IFOrigin: "",
            // ---- LAYOUT ----
            tlChatHeight: 200,
            videoPanelWidth1: 60,
            videoPanelWidth2: 40,
            resizeActive: false,
            resizeMode: 0,
            resizePos: 0,
            // --- ERROR ---
            showErrorAlert: false,
            errorMessage: false,
        };
    },
    computed: {
        ...mapState("tlclient", ["video", "isLoading", "hasError"]),
        mainLinkIsCustom() {
            return !this.video?.id;
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
        activeChatGridRow() {
            if (this.activeChat.length < 4) {
                return { "grid-template-rows": "1fr" };
            }
            return { "grid-template-rows": "1fr 1fr" };
        },
        userdata() {
            return this.$store.state.userdata;
        },
        user() {
            return this.$store.state.userdata.user;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query.video": function () {
            if (this.$route.name === "tlclient" && this.$route.query.video) {
                this.init();
            }
        },
        mainStreamLink() {
            if (
                this.$route.query.video
                && this.mainStreamLink !== this.$route.query.video
            ) {
                this.$router.replace({ path: "/tlclient", query: {} });
            }
        },
    },
    mounted() {
        this.init();
        if (localStorage.getItem("Holodex-TLClient")) {
            const defaultSetting = JSON.parse(
                localStorage.getItem("Holodex-TLClient"),
            );
            if (defaultSetting.tlChatHeight) {
                this.tlChatHeight = defaultSetting.tlChatHeight;
            }
            if (defaultSetting.videoPanelWidth1) {
                this.videoPanelWidth1 = defaultSetting.videoPanelWidth1;
            }
            if (defaultSetting.videoPanelWidth2) {
                this.videoPanelWidth2 = defaultSetting.videoPanelWidth2;
            }
        }
    },
    methods: {
        init() {
            this.firstLoad = true;
            this.modalNexus = true;
            this.modalMode = 3;
            this.collabLink = [];
            this.unloadVideo();
            this.unloadAll();
            this.checkLoginValidity();
        },
        IFrameLoaded(event, target: string) {
            for (let i = 0; i < this.activeChat.length; i += 1) {
                if (this.activeChat[i].text === target) {
                    this.activeChat[i].IFrameEle = event.target;
                    switch (target.slice(0, 3)) {
                        case "YT_": {
                            if (event.target.contentWindow) {
                                event.target.contentWindow.postMessage(
                                    {
                                        n: "HolodexSync",
                                        d: "Initiate",
                                    },
                                    "https://www.youtube.com",
                                );
                            } else {
                                let trial = 0;
                                const id = setInterval(() => {
                                    if (event.target.contentWindow) {
                                        event.target.contentWindow?.postMessage(
                                            {
                                                n: "HolodexSync",
                                                d: "Initiate",
                                            },
                                            "https://www.youtube.com",
                                        );
                                        clearInterval(id);
                                        return;
                                    }
                                    trial += 1;
                                    if (trial === 10) {
                                        clearInterval(id);
                                    }
                                }, 1000);
                            }
                            break;
                        }

                        case "TW_": {
                            if (event.target.contentWindow) {
                                event.target.contentWindow.postMessage(
                                    {
                                        n: "HolodexSync",
                                        d: "Initiate",
                                    },
                                    "https://www.twitch.tv",
                                );
                            } else {
                                let trial = 0;
                                const id = setInterval(() => {
                                    if (event.target.contentWindow) {
                                        event.target.contentWindow?.postMessage(
                                            {
                                                n: "HolodexSync",
                                                d: "Initiate",
                                            },
                                            "https://www.twitch.tv",
                                        );
                                        clearInterval(id);
                                        return;
                                    }
                                    trial += 1;
                                    if (trial === 10) {
                                        clearInterval(id);
                                    }
                                }, 1000);
                            }
                            break;
                        }

                        default:
                            break;
                    }
                }
            }
        },
        addEntry() {
            // SEND TO HOLODEX +
            this.activeChat.forEach((e) => {
                switch (e.text.slice(0, 3)) {
                    case "YT_":
                        e.IFrameEle?.contentWindow?.postMessage(
                            {
                                n: "HolodexSync",
                                d:
                                    this.localPrefix
                                    + this.profile[this.profileIdx].Prefix
                                    + this.inputString
                                    + this.profile[this.profileIdx].Suffix,
                            },
                            "https://www.youtube.com",
                        );
                        break;

                    case "TW_":
                        e.IFrameEle?.contentWindow?.postMessage(
                            {
                                n: "HolodexSync",
                                d:
                                    this.localPrefix
                                    + this.profile[this.profileIdx].Prefix
                                    + this.inputString
                                    + this.profile[this.profileIdx].Suffix,
                            },
                            "https://www.twitch.tv",
                        );
                        break;

                    default:
                        break;
                }
            });

            const bodydt = {
                name: this.userdata.user.username,
                timestamp: Date.now(),
                message:
                    this.profile[this.profileIdx].Prefix
                    + this.inputString
                    + this.profile[this.profileIdx].Suffix,
                cc: this.profile[this.profileIdx].useCC
                    ? this.profile[this.profileIdx].CC
                    : "",
                oc: this.profile[this.profileIdx].useOC
                    ? this.profile[this.profileIdx].OC
                    : "",
                source: "user",
            };

            // SEND TO API
            backendApi
                .postTL({
                    videoId: this.video?.id || "custom",
                    jwt: this.userdata.jwt,
                    lang: this.TLLang.value,
                    ...(!this.video?.id && { custom_video_id: this.mainStreamLink }),
                    body: bodydt,
                })
                .then(({ status, data }) => {
                    if (status !== 200) {
                        console.log(`ERR : ${data}`);
                    }
                })
                .catch((err) => {
                    console.log(`ERR : ${err}`);
                });

            this.collabLinks.forEach((link) => {
                if (!link) return;
                // TODO: this doesn't make complete sense
                // Not all YT videos are able to be submitted normally
                const ytMatch = link.match(VIDEO_URL_REGEX)?.[5];
                backendApi
                    .postTL({
                        videoId: ytMatch || "custom",
                        jwt: this.userdata.jwt,
                        lang: this.TLLang.value,
                        ...(!ytMatch && { custom_video_id: link }),
                        body: bodydt,
                    })
                    .then(({ status, data }) => {
                        if (status !== 200) {
                            console.log(`ERR : ${data}`);
                            this.errorMessage = data;
                            this.showError = true;
                        }
                    })
                    .catch((err) => {
                        console.log(`ERR : ${err}`);
                        this.errorMessage = err;
                        this.showError = true;
                    });
            });

            this.inputString = "";
        },
        deleteAuxLink(idx: number) {
            if (this.collabLinks.length !== 1) {
                this.collabLinks.splice(idx, 1);
            }
        },
        modalNexusOutsideClick() {
            if (this.modalMode !== 3) {
                this.modalNexus = false;
            }
        },
        settingOKClick() {
            // const parseVideoID = getVideoIDFromUrl(this.mainStreamLink);
            // if (!parseVideoID) {
            //     return;
            // }
            const ytId = this.mainStreamLink.match(VIDEO_URL_REGEX);
            const id = ytId?.[5] || this.mainStreamLink;
            this.$store.commit("tlclient/resetState");
            this.$store.commit("tlclient/setId", id);
            this.$store.dispatch("tlclient/fetchVideo");

            this.localPrefix = `[${this.TLLang.value}] `;
            this.modalNexus = false;
            if (this.firstLoad) {
                this.loadChat(this.mainStreamLink);
                this.loadVideo();
                this.collabLinks.forEach((e) => {
                    this.loadChat(e);
                });
                this.firstLoad = false;
            }
        },
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
        profileDown(isTab) {
            if (this.profileIdx === this.profile.length - 1) {
                this.profileIdx = isTab ? 1 : 0;
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
        //= ======================== PROFILE CONTROLLER ========================

        // ---------------------- ACTIVE CHAT CONTROLLER ----------------------
        unloadAll() {
            this.activeChat = [];
        },
        closeActiveChat(idx: number) {
            this.activeChat.splice(idx, 1);
        },
        URLExtender(s: string) {
            switch (s.slice(0, 3)) {
                case "YT_":
                    return `https://www.youtube.com/live_chat?v=${s.slice(
                        3,
                    )}&embed_domain=${window.location.hostname}`;

                case "TW_":
                    return `https://www.twitch.tv/embed/${s.slice(3)}/chat?parent=${
                        window.location.hostname
                    }`;

                default:
                    return "";
            }
        },
        loadChat(s: string) {
            const StreamURL = getVideoIDFromUrl(s);
            if (StreamURL) {
                switch (StreamURL.type) {
                    case "twitch": {
                        this.activeChat.push({
                            text: `TW_${StreamURL.id}`,
                            IFrameEle: undefined,
                        });
                        break;
                    }

                    default: {
                        this.activeChat.push({
                            text: `YT_${StreamURL.id}`,
                            IFrameEle: undefined,
                        });
                        break;
                    }
                }
            }
        },
        getVideoIDFromUrl,
        //= ====================== ACTIVE CHAT CONTROLLER ======================

        // ---------------------- VIDEO CONTROLLER ----------------------
        loadVideo() {
            this.vidPlayer = true;
            // const checker = setInterval(() => {
            //     const PlayerDiv = document.getElementById("player");
            //     if (PlayerDiv) {
            //         clearInterval(checker);
            //         const StreamURL = getVideoIDFromUrl(this.mainStreamLink);
            //         if (StreamURL) {
            //             this.vidType = StreamURL.type;
            //             switch (StreamURL.type) {
            //                 case "twitch":
            //                     this.loadVideoTW(StreamURL.id, true);
            //                     break;

            //                 case "twitch_vod":
            //                     this.loadVideoTW(StreamURL.id, false);
            //                     break;

            //                 case "twitcast":
            //                     this.setupIframeTC(StreamURL.id, StreamURL.id, true);
            //                     break;

            //                 case "twitcast_vod":
            //                     this.setupIframeTC(StreamURL.id, StreamURL.channel.name, false);
            //                     break;

            //                 case "niconico":
            //                     // niconico doesn't allow third party player hosting... at least for now...
            //                     // this.setupIframeNC(StreamURL.id, true);
            //                     break;

            //                 case "niconico_vod":
            //                     this.setupIframeNC(StreamURL.id, false);
            //                     break;

            //                 case "bilibili":
            //                     // bilibili live player is flash -> the one in FLASH link in the share button
            //                     // https://s1.hdslb.com/bfs/static/blive/live-assets/player/flash/pageplayer-latest.swf?room_id=0&cid=xxxxxx&state=LIVE
            //                     break;

            //                 case "bilibili_vod":
            //                     this.setupIframeBL(StreamURL.id);
            //                     break;

            //                 default:
            //                     this.loadVideoYT(StreamURL.id);
            //                     break;
            //             }
            //         }
            //     }
            // }, 1000);
        },
        unloadVideo() {
            this.vidPlayer = false;
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
        loadIframe(): void {
            if (this.vidIframeEle) {
                const PlayerDiv = document.getElementById("player");
                if (PlayerDiv) {
                    PlayerDiv.append(this.vidIframeEle);
                }
            }
        },
        //= ================  IFRAME  =================
        //= ====================== VIDEO CONTROLLER ======================

        // --------------------------------- LAYOUT CONTROLLER ---------------------------------
        resizeMouseLeave(mode: number) {
            if (mode === this.resizeMode) {
                this.resizeActive = false;
                localStorage.setItem(
                    "Holodex-TLClient",
                    JSON.stringify({
                        tlChatHeight: this.tlChatHeight,
                        videoPanelWidth1: this.videoPanelWidth1,
                        videoPanelWidth2: this.videoPanelWidth2,
                    }),
                );
            }
        },
        resizeMouseDown(event: any, resizeSwitch: number) {
            if (!this.resizeActive) {
                this.resizeActive = true;
                this.resizeMode = resizeSwitch;
                if (this.resizeMode === 0) {
                    this.resizePos = event.clientY;
                } else {
                    this.resizePos = event.clientX;
                }
            }
        },
        resizeMouseUp() {
            this.resizeActive = false;
            localStorage.setItem(
                "Holodex-TLClient",
                JSON.stringify({
                    tlChatHeight: this.tlChatHeight,
                    videoPanelWidth1: this.videoPanelWidth1,
                    videoPanelWidth2: this.videoPanelWidth2,
                }),
            );
        },
        resizeMouseMove(event: any) {
            if (this.resizeActive) {
                if (this.resizeMode === 0) {
                    const yChange = event.clientY - this.resizePos;
                    this.resizePos = event.clientY;
                    if (this.tlChatHeight - yChange < 100) {
                        return;
                    }
                    this.tlChatHeight -= yChange;
                } else {
                    const xChange = ((event.clientX - this.resizePos) * 100) / window.innerWidth;
                    this.resizePos = event.clientX;
                    if (this.activeChat.length < 2) {
                        if (
                            this.videoPanelWidth1 + xChange > 75
                            || this.videoPanelWidth1 + xChange < 33
                        ) {
                            return;
                        }
                        this.videoPanelWidth1 += xChange;
                    } else {
                        if (
                            this.videoPanelWidth2 + xChange > 75
                            || this.videoPanelWidth2 + xChange < 33
                        ) {
                            return;
                        }
                        this.videoPanelWidth2 += xChange;
                    }
                }
            }
        },
        // ================================= LAYOUT CONTROLLER =================================

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
                if (this.$route.query.video) {
                    this.mainStreamLink = videoCodeParser(this.$route.query.video);
                }
            }
        },
        changeUsernameClick() {
            this.$router.push({ path: "/login" });
        },
        handleVideoClicked(video) {
            this.videoSelectDialog = false;
            this.mainStreamLink = video.type === "placeholder"
                ? video.link
                : `https://youtube.com/watch?v=${video.id}`;
        },
    },
};
</script>

<style>
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
.activeChatIFrame {
  width: 100%;
  height: 100%;
}
.tl-topbar > *:not(:first-child):not(:last-child) {
  margin: 0px 3px;
}
.tl-topbar > * {
  border-radius: 0px;
  text-transform: unset !important;
}

#player > div,
#player > div > iframe {
  width: 100%;
  height: 100%;
}
</style>
