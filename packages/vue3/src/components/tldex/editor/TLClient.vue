<template>
  <div class="max-h-full p-2">
    <div class="flex flex-grow flex-col" style="height: 98vh; width: 100%">
      <div
        height="30"
        class="tl-topbar btn-group justify-start px-0"
        color="secondary"
      >
        <h-btn small to="/" icon="i-material-symbols:home-outline-rounded">
          {{ $t("component.mainNav.home") }}
        </h-btn>
        <h-btn small @click="configModal = true">
          {{ $t("views.tlClient.menu.setting") }}
        </h-btn>
        <h-btn
          small
          :to="
            activeChat.length
              ? `/scripteditor?video=${activeChat[0].text}`
              : undefined
          "
        >
          {{ $t("component.videoCard.openScriptEditor") }}
        </h-btn>
        <div class="mx-auto w-auto" />
        <h-btn v-if="!showVideo" small @click="loadVideo()">
          {{ $t("views.tlClient.menu.loadVideo") }}
        </h-btn>
        <h-btn v-if="showVideo" small @click="unloadVideo()">
          {{ $t("views.tlClient.menu.unloadVideo") }}
        </h-btn>
        <!-- <div class="mx-auto w-auto" /> -->

        <h-btn small @click="promptAddChat">
          {{ $t("views.tlClient.menu.loadChat") }}
        </h-btn>
        <h-btn small @click="promptCloseAllChat">
          {{ $t("views.tlClient.menu.unloadChat") }}
        </h-btn>
      </div>
      <div
        class="flex flex-row items-stretch"
        style="height: 100%"
        @mousemove="resizeMouseMove($event)"
        @mouseleave="resizeMouseLeave(1)"
        @mouseup="resizeMouseUp()"
      >
        <div
          class="flex flex-shrink flex-grow flex-col"
          :width="
            activeChat.length < 2
              ? videoPanelWidth1 + '%'
              : videoPanelWidth2 + '%'
          "
          style="height: 100%; display: flex"
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
          <div
            v-if="showVideo"
            class="flex flex-shrink flex-grow flex-col"
            outlined
            height="100%"
          >
            <!-- <v-card id="player" height="100%" width="100%" /> -->
          </div>
          <div
            v-if="showVideo"
            id="horizontal-resize-bar"
            style="
              cursor: s-resize;
              min-height: 9px;
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
                margin-top: 3px;
              "
            />
          </div>
          <!-- <LiveTranslations
            v-if="mainID"
            :tl-lang="TLLang.value"
            :tl-client="true"
            :video="{ id: mainID }"
            :video-id="mainID"
            :class="{
              'flex-shrink': true,
              'tl-full-height': false,
            }"
            :style="{ height: showVideo ? tlChatHeight + 'px' : '100%' }"
            :use-local-subtitle-toggle="false"
          /> -->
          <v-card
            v-if="profileDisplay && activeChat.length > 1"
            class="ProfileListCard flex flex-col"
          >
            <span v-for="(prf, index) in profile" :key="index">
              <span v-if="index === profileIdx">></span>
              {{ index + 1 + ". " + prf.Name }}
            </span>
          </v-card>
        </div>
        <div
          v-if="activeChat.length > 0"
          id="vertical-resize-bar"
          style="cursor: e-resize; width: 9px"
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
              margin-left: 3px;
            "
          />
        </div>
        <div
          v-if="activeChat.length > 0"
          class="ChatPanelContainer"
          :style="activeChatGridRow"
          variant="outlined"
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
            class="flex flex-col"
            variant="outlined"
          >
            <p class="text-center" style="margin-top: 5px">
              {{ ChatURL.text }}
              <v-icon class="float-right" @click="unloadChatAtIndex(index)">
                {{ "mdiCloseCircle" }}
              </v-icon>
            </p>
            <iframe
              class="activeChatIFrame"
              :src="videoIDToChatEmbedURL(ChatURL.text)"
              frameborder="0"
              @load="IFrameLoaded($event, ChatURL.text)"
            />
          </v-card>
          <v-card
            v-if="profileDisplay && activeChat.length < 2"
            class="ProfileListCard flex flex-col"
          >
            <span v-for="(prf, index) in profile" :key="index">
              <span v-if="index === profileIdx">></span>
              {{ index + 1 + ". " + prf.Name }}
            </span>
          </v-card>
        </div>
      </div>

      <v-container
        @keydown.up.exact="profileUp()"
        @keydown.down.exact="profileDown()"
        @keydown.tab.exact.prevent="profileDown()"
        @keydown.shift.tab.exact.prevent="profileJumpToDefault()"
        @keydown.ctrl.0.exact.prevent="profileJump(0)"
        @keydown.ctrl.1.exact.prevent="profileJump(1)"
        @keydown.ctrl.2.exact.prevent="profileJump(2)"
        @keydown.ctrl.3.exact.prevent="profileJump(3)"
        @keydown.ctrl.4.exact.prevent="profileJump(4)"
        @keydown.ctrl.5.exact.prevent="profileJump(5)"
        @keydown.ctrl.6.exact.prevent="profileJump(6)"
        @keydown.ctrl.7.exact.prevent="profileJump(7)"
        @keydown.ctrl.8.exact.prevent="profileJump(8)"
      >
        <h-row>
          <h-input
            v-model="inputString"
            placeholder="Type TL Here <Enter key to send>"
            outlined
            hide-details
            dense
            @keypress.enter="addEntry()"
          >
            <template #prepend>
              <span
                v-if="profile[profileIdx].Prefix"
                class="btn-disabled btn-ghost btn"
              >
                {{ profile[profileIdx].Prefix }}
              </span>
            </template>
            <template #append>
              <button
                v-if="profile[profileIdx].Suffix"
                class="btn-disabled btn"
              >
                {{ profile[profileIdx].Suffix }}
              </button>
            </template>
          </h-input>
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
              {{ TLSetting ? "mdiCogOff" : "mdiCog" }}
            </v-icon>
          </v-btn>
        </h-row>
        <v-expand-transition>
          <v-card v-if="TLSetting" class="mt-2">
            <v-card-subtitle>
              Current Profile [{{ profile[profileIdx].Name }}] Settings
              <v-icon class="float-right" @click="TLSetting = false">
                {{ "icons.mdiClose" }}
              </v-icon>
              <h-tooltip placement="left">
                <template #activator>
                  <v-icon class="float-right">
                    {{ "mdiKeyboard" }}
                  </v-icon>
                </template>
                <span>While typing in TL box</span>
                <br />
                <span>
                  <kbd>⇧</kbd>
                  <kbd>⇩</kbd>
                  to change Profiles
                </span>
                <br />
                <span>
                  <kbd>Ctrl+[1~9]</kbd>
                  to quick switch to Profile
                </span>
              </h-tooltip>
            </v-card-subtitle>
            <v-card-text class="align-stretch flex">
              <h-input
                v-model="localPrefix"
                :title="$t('views.tlClient.tlControl.localPrefix')"
              />
              <h-input
                v-model="profile[profileIdx].Prefix"
                :title="$t('views.tlClient.tlControl.prefix')"
                class="mr-2"
              />
              <h-input
                v-model="profile[profileIdx].Suffix"
                :title="$t('views.tlClient.tlControl.suffix')"
                class="mr-2"
              />
            </v-card-text>
            <v-card-text>
              <v-btn style="margin-right: 5px" @click="addProfile">
                {{ $t("views.tlClient.tlControl.addProfile") }}
              </v-btn>
              <v-btn
                style="margin-right: 5px"
                @click="profile.splice(profileIdx, 1)"
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

    <h-dialog v-model="configModal" persistent>
      <div class="card card-side bg-base-100 shadow-xl">
        <div class="card-body max-w-md shrink-0">
          <h2 class="card-title">
            {{ $t("views.tlClient.settingPanel.title") }}
          </h2>
          <div class="border-1 border-bgColor-50">
            {{ $t("views.watch.uploadPanel.usernameText") + " : " }}
            <span class="font-bold">{{ user?.username }}</span>
            <a class="link ml-1 text-sm" @click="changeUsernameClick()">
              {{ $t("views.watch.uploadPanel.usernameChange") }}
            </a>
          </div>
          <div>
            <h-input :title="$t('views.watch.uploadPanel.tlLang')">
              <template #input>
                <h-select
                  v-model="TLLang"
                  :items="TL_LANGS"
                  item-title="text"
                  item-value="value"
                  return-object
                  @change="localPrefix = '[' + TLLang.value + '] '"
                />
              </template>
            </h-input>
          </div>
          <div>
            <h-input
              v-model="mainStreamLink"
              :title="$t('views.tlClient.settingPanel.mainStreamLink')"
            />
            <figure v-if="thumbnail">
              <img :src="thumbnail" />
            </figure>
          </div>
          <div>
            <h-input
              v-for="(_, index) in collabLinks"
              :key="'collab-link' + index"
              v-model="collabLinks[index]"
              :title="
                index == 0 ? $t('views.tlClient.settingPanel.collabLink') : ''
              "
            >
              <template #prepend>
                <h-btn
                  class="btn-info !h-12"
                  icon="i-mdi:minus-circle"
                  @click="deleteAuxLink(index)"
                />
              </template>
              <template #append>
                <h-btn
                  class="btn-info !h-12"
                  icon="i-mdi:plus-circle"
                  @click="collabLinks.push('')"
                />
              </template>
            </h-input>
          </div>
          <div class="card-actions mt-6 justify-stretch">
            <h-btn class="btn-primary w-full" @click="settingOKClick()">
              {{ $t("views.tlClient.okBtn") }}
            </h-btn>
          </div>
        </div>
      </div>
    </h-dialog>
  </div>
</template>

<script lang="ts">
import { TL_LANGS } from "@/utils/consts";
import { getVideoIDFromUrl, videoCodeParser } from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import { useSiteStore } from "@/stores";
import { Profile } from "./types";
import { getVideoThumbnails } from "@/utils/functions";

export default defineComponent({
  name: "Tlclient",
  metaInfo() {
    return {
      get title() {
        return "TLClient - Holodex";
      },
    };
  },
  components: {},
  setup() {
    const site = useSiteStore();

    const router = useRouter();
    if (!site.user || !site.jwtToken) {
      router.push("/login");
    }

    const activeChat: {
      id: string;
      iframeElement: HTMLIFrameElement | null;
    }[] = reactive([]);

    return { user: site.user, jwt: site.jwtToken, site, activeChat };
  },
  data() {
    return {
      TL_LANGS,
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
      ] as Profile[],
      profileContainer: {},
      profileIdx: 0,
      profileDisplay: false,
      profileDisplayTimer: undefined as undefined | number,
      inputString: "",
      localPrefix: `[${TL_LANGS[0].value}] `,
      // ------ MODAL --------
      configModal: true,
      // ------ SETTING ------
      TLLang: { ...TL_LANGS[0] },
      mainID: "",
      mainStreamLink: "",
      collabLinks: [""],
      // ---- ACTIVE CHAT ----
      // activeChat: [] as any[],
      // activeURLStream: "",
      // ---- ACTIVE VIDEO ----
      // activeURLInput: "",
      // vidType: "",
      showVideo: false,
      // vidIframeEle: null as HTMLElement | null,
      // player: null,
      // IFOrigin: "",
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
    thumbnail() {
      const vid = getVideoIDFromUrl(this.mainStreamLink);
      if (vid && vid.type === "yt" && vid.id.length === 11) {
        return getVideoThumbnails(vid.id, false).maxres;
      }
      return "";
    },
    activeChatGridRow() {
      if (this.activeChat.length < 4) {
        return {
          "grid-template-rows": "1fr",
          width:
            this.activeChat.length < 2
              ? 100 - this.videoPanelWidth1 + "%"
              : 100 - this.videoPanelWidth2 + "%",
        };
      }
      return {
        "grid-template-rows": "1fr 1fr",
        width:
          this.activeChat.length < 2
            ? 100 - this.videoPanelWidth1 + "%"
            : 100 - this.videoPanelWidth2 + "%",
      };
    },
    collabLinkIDs() {
      return this.collabLinks.map((e) => getVideoIDFromUrl(e));
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    "$route.query.video": function () {
      if (this.$route.name === "tlclient" && this.$route.query.video) {
        this.init();
      }
    },
  },
  mounted() {
    this.init();
    if (localStorage.getItem("Holodex-TLClient")) {
      const defaultSetting = JSON.parse(
        localStorage.getItem("Holodex-TLClient") as any
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
    getVideoIDFromUrl,
    getVideoThumbnails,
    init() {
      this.firstLoad = true;
      this.configModal = true;
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
                  "https://www.youtube.com"
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
                      "https://www.youtube.com"
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
                  "https://www.twitch.tv"
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
                      "https://www.twitch.tv"
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
                  this.localPrefix +
                  this.profile[this.profileIdx].Prefix +
                  this.inputString +
                  this.profile[this.profileIdx].Suffix,
              },
              "https://www.youtube.com"
            );
            break;

          case "TW_":
            e.IFrameEle?.contentWindow?.postMessage(
              {
                n: "HolodexSync",
                d:
                  this.localPrefix +
                  this.profile[this.profileIdx].Prefix +
                  this.inputString +
                  this.profile[this.profileIdx].Suffix,
              },
              "https://www.twitch.tv"
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
          this.profile[this.profileIdx].Prefix +
          this.inputString +
          this.profile[this.profileIdx].Suffix,
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
        const ytVideoId = link.match(VIDEO_URL_REGEX)?.groups.id;
        backendApi
          .postTL({
            videoId: ytVideoId || "custom",
            jwt: this.userdata.jwt,
            lang: this.TLLang.value,
            ...(!ytVideoId && { custom_video_id: link }),
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
      } else {
        this.collabLinks = [""];
      }
    },
    settingOKClick() {
      const parseVideoID = getVideoIDFromUrl(this.mainStreamLink);
      if (!parseVideoID) {
        return;
      }

      this.mainID = parseVideoID.id;

      this.localPrefix = `[${this.TLLang.value}] `;
      this.configModal = false;
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
          JSON.stringify(this.profile[this.profileIdx - 1])
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
          JSON.stringify(this.profile[this.profileIdx + 1])
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
      let profileName = prompt(
        this.$t("views.tlClient.addProfilePanel.title"),
        this.$t("views.tlClient.addProfilePanel.inputLabel")
      )?.trim();
      if (!profileName) {
        profileName = `Profile ${this.profile.length}`;
      }

      // TODO store.addProfile(profileName);
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
    promptCloseAllChat() {
      const res = confirm(this.$t("views.tlClient.unloadChatTitle"));
      if (res) {
        this.unloadAll();
      }
    },
    unloadChatAtIndex(idx: number) {
      this.activeChat.splice(idx, 1);
    },
    videoIDToChatEmbedURL(s: string) {
      switch (s.slice(0, 3)) {
        case "YT_":
          return `https://www.youtube.com/live_chat?v=${s.slice(
            3
          )}&embed_domain=${window.location.hostname}`;

        case "TW_":
          return `https://www.twitch.tv/embed/${s.slice(3)}/chat?parent=${
            window.location.hostname
          }`;

        default:
          return "";
      }
    },
    promptAddChat() {
      const res = prompt(
        this.$t("views.tlClient.loadChatPanel.title") +
          ": " +
          this.$t("views.tlClient.loadChatPanel.inputLabel"),
        "https://youtube.com/watch?v=..."
      );
      if (res) {
        this.loadChat(res);
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
      this.showVideo = true;
    },
    unloadVideo() {
      this.showVideo = false;
    },
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
          })
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
        })
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
          const xChange =
            ((event.clientX - this.resizePos) * 100) / window.innerWidth;
          this.resizePos = event.clientX;
          if (this.activeChat.length < 2) {
            if (
              this.videoPanelWidth1 + xChange > 75 ||
              this.videoPanelWidth1 + xChange < 33
            ) {
              return;
            }
            this.videoPanelWidth1 += xChange;
          } else {
            if (
              this.videoPanelWidth2 + xChange > 75 ||
              this.videoPanelWidth2 + xChange < 33
            ) {
              return;
            }
            this.videoPanelWidth2 += xChange;
          }
        }
      }
    },
    // ================================= LAYOUT CONTROLLER =================================

    async checkLoginValidity() {
      const check = await backendApi.loginIsValid(this.jwt);
      if (check === false) {
        this.site.logout();
        this.$router.push("/login");
      } else if (check.data && check.data.id) {
        if (this.$route.query.video) {
          this.mainStreamLink = videoCodeParser(
            this.$route.query.video as string
          );
        }
      }
    },
    changeUsernameClick() {
      window.open("/login", "_self");
    },
  },
});
</script>

<style>
.tl-topbar {
  top: 0px;
  z-index: 1006;
  transform: translateY(0%);
  height: 32px;
  width: calc(100% + 0px);
  margin-bottom: 4px;
  --v-theme-overlay-multiplier: var(--v-theme-secondary-overlay-multiplier);
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-on-secondary)) !important;

  align-items: center;
  display: flex;
  flex: 1 1 auto;
  max-width: 100%;
  padding: 0 8px;
  position: relative;
  text-align: end;
  width: 100%;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 0px 0px rgba(0, 0, 0, 0.12);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.0333333333em;
  line-height: 1.25rem;
  text-transform: none;
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
</style>
