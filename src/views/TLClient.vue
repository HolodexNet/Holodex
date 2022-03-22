<template>
  <v-container fill-height>
    <v-card
      v-if="menuBool"
      class="TopMenu"
    >
      <v-container class="d-flex align-baseline">
        <v-btn
          elevation="4"
          color="secondary"
          @click="modalMode = 3; modalNexus = true"
        >
          Setting
        </v-btn>
        <v-divider
          vertical
          style="margin-left: 5px; margin-right:5px"
        />
        <v-btn
          elevation="4"
          color="secondary"
          @click="loadVideo()"
        >
          Load Video
        </v-btn>
        <v-btn
          elevation="4"
          color="secondary"
          style="margin-left: 5px; margin-right:5px"
          @click="unloadVideo()"
        >
          Unload Video
        </v-btn>

        <v-btn
          elevation="4"
          color="secondary"
          @click="modalMode = 4; modalNexus = true; activeURLStream = '';"
        >
          Load Chat
        </v-btn>
        <v-btn
          elevation="4"
          color="secondary"
          style="margin-left:5px"
          @click="modalMode = 5; modalNexus = true"
        >
          Unload Chat
        </v-btn>
      </v-container>
    </v-card>
    <div class="d-flex flex-column" style="height:100%; width:100%">
      <v-btn
        block
        elevation="4"
        color="primary"
        small
        @click="menuBool = !menuBool"
      >
        Menu
      </v-btn>
      <div class="d-flex align-stretch flex-row" style="height:100%" @click="menuBool = false">
        <v-card class="d-flex flex-column grow" height="100%;" :width="activeChat.length < 2 ? '50%' : '30%'">
          <v-card
            v-if="vidPlayer"
            height="50%"
            class="d-flex flex-column"
            outlined
          >
            <v-card
              id="player"
              height="100%"
              width="100%"
            />
          </v-card>
          <v-divider />
          <TLChatPanel
            v-if="!isLoading && !hasError"
            :video="video"
            :class="{
              'stick-bottom': $store.state.settings.liveTlStickBottom,
              'tl-full-height': false,
            }"
            style="height: 300px;"
            :use-local-subtitle-toggle="false"
          />
          <v-card v-if="profileDisplay" class="ProfileListCard d-flex flex-column">
            <span v-for="(prf, index) in profile" :key="index"><span v-if="index === profileIdx">> </span>{{ (index + 1) + '. ' + prf.Name }}</span>
          </v-card>
        </v-card>
        <v-card
          v-if="activeChat.length > 0"
          class="ChatPanelContainer"
          height="100%"
          :width="activeChat.length < 2 ? '50%' : '70%'"
          :style="activeChatGridRow"
          outlined
        >
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
      >
        <v-row class="align-baseline">
          <v-text-field
            v-model="inputString"
            @keypress.enter="addEntry()"
          />
          <v-btn style="margin-left:10px" @click="addEntry()">
            Enter
          </v-btn>
        </v-row>
        <v-row class="align-stretch">
          <v-col cols="2">
            <v-text-field
              v-model="profile[profileIdx].Prefix"
              label="Prefix"
              dense
              rounded
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="profile[profileIdx].Suffix"
              label="Suffix"
              dense
              rounded
              outlined
            />
          </v-col>
          <!--
          <v-checkbox
            v-model="profile[profileIdx].useCC"
            class="shrink"
            label="Font Colour : "
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
            label="Outline Colour : "
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
          <v-col cols="2" style="margin-left:auto">
            <v-text-field
              v-model="localPrefix"
              label="Prefix"
              dense
              rounded
              outlined
            />
          </v-col>
        </v-row>
        <v-row>
          <v-btn style="margin-right:5px" @click="modalMode = 1; modalNexus = true; addProfileNameString = 'Profile ' + profile.length;">
            Add Profile
          </v-btn>
          <v-btn style="margin-right:5px" @click="modalMode = 2; modalNexus = true">
            Remove Profile
          </v-btn>
          <v-btn style="margin-right:5px" @click="shiftProfileUp()">
            Shift Up
          </v-btn>
          <v-btn @click="shiftProfileDown()">
            Shift Down
          </v-btn>
        </v-row>
      </v-container>
    </div>

    <!---------   COLOUR MODAL --------->
    <v-dialog
      v-model="colourDialogue"
      max-width="300px"
      @click:outside.prevent="colourPickerClose();"
    >
      <v-card>
        <v-color-picker v-if="colourPick === 1" v-model="profile[profileIdx].CC" />
        <v-color-picker v-else-if="colourPick === 2" v-model="profile[profileIdx].OC" />
        <v-card-title :style="textStyle" style="font-weight:bold;">
          The quick brown fox jumps over the lazy dog
        </v-card-title>
        <v-card-actions>
          <v-btn @click="colourPickerClose();">
            Cancel
          </v-btn>

          <v-btn style="margin-left:auto" @click="colourPickerOK()">
            Ok
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
      6 Login Check
    -->
    <v-dialog
      v-model="modalNexus"
      max-width="600px"
      persistent
      @click:outside="modalNexusOutsideClick();"
    >
      <!---------    ADD PROFILE     --------->
      <v-card v-if="modalMode === 1">
        <v-container>
          <v-card-title>
            Add New Profile.
          </v-card-title>
          <v-text-field
            v-model="addProfileNameString"
            label="Profile Name"
            placeholder="Profile Name"
            dense
            rounded
            outlined
          />
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              Cancel
            </v-btn>

            <v-btn style="margin-left:auto" @click="addProfile()">
              Ok
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    Remove PROFILE     --------->
      <v-card v-if="modalMode === 2">
        <v-container>
          <v-card-title>
            Confirm remove profile {{ profile[profileIdx].Name }}.
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              Cancel
            </v-btn>

            <v-btn style="margin-left:auto" @click="deleteProfile()">
              Ok
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    SETTING     --------->
      <v-card v-if="modalMode === 3">
        <v-container>
          <v-card-title>
            Setting
          </v-card-title>
          <v-card-subtitle>{{ 'TL will be uploaded under username : ' + userdata.user.username }}</v-card-subtitle>
          <v-select
            v-model="TLLang"
            :items="TL_LANGS"
            :item-text="item => item.text + ' (' + item.value + ')'"
            item-value="value"
            label="TL Language"
            return-object
            @change="localPrefix = '[' + TLLang.value + '] '"
          />
          <v-text-field v-model="mainStreamLink" readonly label="Main Stream Link" />
          <v-card-title>Collab Links</v-card-title>
          <v-text-field
            v-for="(AuxLink, index) in collabLinks"
            :key="index"
            v-model="collabLinks[index]"
            :append-outer-icon="mdiPlusCircle"
            :prepend-icon="mdiMinusCircle"
            style="margin-left: 17px"
            @click:prepend="deleteAuxLink(index)"
            @click:append-outer="collabLinks.push('');"
          />
          <v-card-actions class="d-flex flex-row justify-center">
            <v-btn @click="settingOKClick()">
              Ok
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  LOAD ACTIVE CHAT ------->
      <v-card v-if="modalMode === 4">
        <v-container>
          <v-card-title>
            Load chat
          </v-card-title>
          <v-text-field v-model="activeURLStream" label="Stream Link" />
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              Cancel
            </v-btn>

            <v-btn style="margin-left:auto" @click="loadChat(activeURLStream); modalNexus = false;">
              Ok
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!-------  UNLOAD ALL ACTIVE CHAT ------->
      <v-card v-if="modalMode === 5">
        <v-container>
          <v-card-title>
            Unload ALL active chat?
          </v-card-title>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              Cancel
            </v-btn>

            <v-btn style="margin-left:auto" @click="unloadAll(); modalNexus = false;">
              Ok
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-dialog>
    <!--========   NEXUS MODAL =======-->
  </v-container>
</template>

<script lang="ts">
import TLChatPanel from "@/components/tlclient/TLChatPanel.vue";
import { TL_LANGS } from "@/utils/consts";
import { mdiPlusCircle, mdiMinusCircle, mdiCloseCircle } from "@mdi/js";
import { getVideoIDFromUrl } from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import { mapState } from "vuex";

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
        TLChatPanel,
    },
    data() {
        return {
            TL_LANGS,
            mdiPlusCircle,
            mdiMinusCircle,
            mdiCloseCircle,
            menuBool: false,
            firstLoad: true,
            profile: [{
                Name: "Default",
                Prefix: "",
                Suffix: "",
                useCC: false,
                CC: "#000000",
                useOC: false,
                OC: "#000000",
            }],
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
        };
    },
    computed: {
        ...mapState("tlclient", ["video", "isLoading", "hasError"]),
        textStyle() {
            return {
                "-webkit-text-fill-color": (this.profile[this.profileIdx].CC === "") ? "unset" : this.profile[this.profileIdx].CC,
                "-webkit-text-stroke-color": (this.profile[this.profileIdx].OC === "") ? "unset" : this.profile[this.profileIdx].OC,
                "-webkit-text-stroke-width": (this.profile[this.profileIdx].OC === "") ? "0px" : "1px",
            };
        },
        activeChatGridRow() {
            return ({
                "grid-template-rows": this.activeChat.length < 4 ? "1fr" : "1fr 1fr",
            });
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
        "$route.params.video": function () {
            if (this.$route.query.video) {
                this.init();
            }
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.firstLoad = true;
            this.modalNexus = true;
            this.modalMode = 3;
            this.unloadVideo();
            this.unloadAll();
            this.checkLoginValidity();
        },
        IFrameLoaded(event, target: string) {
            for (let i = 0; i < this.activeChat.length; i += 1) {
                if (this.activeChat[i].text === target) {
                    this.activeChat[i].IFrameEle = event.target;
                    switch (target.slice(0, 3)) {
                        case "YT_":
                            event.target.contentWindow?.postMessage({
                                n: "HolodexSync",
                                d: "Initiate",
                            }, "https://www.youtube.com");
                            break;

                        case "TW_":
                            event.target.contentWindow?.postMessage({
                                n: "HolodexSync",
                                d: "Initiate",
                            }, "https://www.twitch.tv");
                            break;

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
                        e.IFrameEle?.contentWindow?.postMessage({
                            n: "HolodexSync",
                            d: this.localPrefix + this.profile[this.profileIdx].Prefix + this.inputString + this.profile[this.profileIdx].Suffix,
                        }, "https://www.youtube.com");
                        break;

                    case "TW_":
                        e.IFrameEle?.contentWindow?.postMessage({
                            n: "HolodexSync",
                            d: this.localPrefix + this.profile[this.profileIdx].Prefix + this.inputString + this.profile[this.profileIdx].Suffix,
                        }, "https://www.twitch.tv");
                        break;

                    default:
                        break;
                }
            });

            // SEND TO API
            backendApi.postTL(this.video.id, this.userdata.user.api_key, this.TLLang.value, {
                name: this.userdata.user.username,
                timestamp: Date.now(),
                message: this.profile[this.profileIdx].Prefix + this.inputString + this.profile[this.profileIdx].Suffix,
                cc: this.profile[this.profileIdx].useCC ? this.profile[this.profileIdx].CC : "",
                oc: this.profile[this.profileIdx].useOC ? this.profile[this.profileIdx].OC : "",
                source: "user",
            }).then(({ status, data }) => {
                if (status !== 200) {
                    console.log(`ERR : ${data}`);
                }
            }).catch((err) => {
                console.log(`ERR : ${err}`);
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
            const parseVideoID = getVideoIDFromUrl(this.mainStreamLink);
            if (!parseVideoID) {
                return;
            }

            this.$store.commit("tlclient/resetState");
            this.$store.commit("tlclient/setId", parseVideoID.id);
            this.$store.dispatch("tlclient/fetchVideo");

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
                this.profileContainer = JSON.parse(JSON.stringify(this.profile[this.profileIdx - 1]));
                this.profile[this.profileIdx - 1] = this.profile[this.profileIdx];
                this.profile[this.profileIdx] = this.profileContainer;
                this.profileIdx -= 1;
                this.profileContainer = {};
            }
            this.showProfileList();
        },
        shiftProfileDown() {
            if ((this.profileIdx !== 0) && (this.profileIdx < this.profile.length - 1)) {
                this.profileContainer = JSON.parse(JSON.stringify(this.profile[this.profileIdx + 1]));
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
                    return `https://www.youtube.com/live_chat?v=${s.slice(3)}&embed_domain=${window.location.hostname}`;

                case "TW_":
                    return `https://www.twitch.tv/embed/${s.slice(3)}/chat?parent=${window.location.hostname}`;

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
        //= ====================== ACTIVE CHAT CONTROLLER ======================

        // ---------------------- VIDEO CONTROLLER ----------------------
        loadVideo() {
            this.vidPlayer = true;
            const checker = setInterval(() => {
                const PlayerDiv = document.getElementById("player");
                if (PlayerDiv) {
                    clearInterval(checker);
                    const StreamURL = getVideoIDFromUrl(this.mainStreamLink);
                    if (StreamURL) {
                        this.vidType = StreamURL.type;
                        switch (StreamURL.type) {
                            case "twitch":
                                this.loadVideoTW(StreamURL.id, true);
                                break;

                            case "twitch_vod":
                                this.loadVideoTW(StreamURL.id, false);
                                break;

                            case "twitcast":
                                this.setupIframeTC(StreamURL.id, StreamURL.id, true);
                                break;

                            case "twitcast_vod":
                                this.setupIframeTC(StreamURL.id, StreamURL.channel.name, false);
                                break;

                            case "niconico":
                                // niconico doesn't allow third party player hosting... at least for now...
                                // this.setupIframeNC(StreamURL.id, true);
                                break;

                            case "niconico_vod":
                                this.setupIframeNC(StreamURL.id, false);
                                break;

                            case "bilibili":
                                // bilibili live player is flash -> the one in FLASH link in the share button
                                // https://s1.hdslb.com/bfs/static/blive/live-assets/player/flash/pageplayer-latest.swf?room_id=0&cid=xxxxxx&state=LIVE
                                break;

                            case "bilibili_vod":
                                this.setupIframeBL(StreamURL.id);
                                break;

                            default:
                                this.loadVideoYT(StreamURL.id);
                                break;
                        }
                    }
                }
            }, 1000);
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
            });
        },
        //= ================  YT  =================

        // -----------------  TW  -----------------
        loadVideoTW(VID:string, Live: boolean) {
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
        },
        //= ================  TW  =================
        //= ====================== VIDEO CONTROLLER ======================

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
                this.$store.commit("setUser", { user: check.data, jwt: this.userdata.jwt });
                if (this.$route.query.video) {
                    this.mainStreamLink = this.queryParser(this.$route.query.video);
                }
            }
        },
        queryParser(queryVideo: string) {
            switch (queryVideo.slice(0, 3)) {
                case "YT_":
                    return (`https://www.youtube.com/watch?v=${queryVideo.slice(3)}`);

                default:
                    return (queryVideo);
            }
        },
    },
};
</script>

<style>
.TopMenu {
  width:100%;
  position:absolute;
  top:0px;
  left:0px;
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
.ChatPanelContainer{
  display: grid;
  grid-auto-flow: column;
}
.activeChatIFrame{
  width: 100%;
  height: 100%;
}
</style>
