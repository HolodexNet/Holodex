<template>
  <div class="max-h-full p-2">
    <div class="flex flex-grow flex-col" style="height: 98vh; width: 100%">
      <div height="30" class="tl-topbar btn-group justify-start px-0">
        <h-btn small to="/" icon="i-material-symbols:home-outline-rounded">
          {{ $t("component.mainNav.home") }}
        </h-btn>
        <div class="h-6 w-2 bg-primary opacity-60" />
        <h-btn no-color class="btn-secondary" small @click="configModal = true">
          {{ $t("views.tlClient.menu.setting") }}
        </h-btn>
        <h-btn
          small
          :to="
            activeChat.length
              ? `/scripteditor?video=${activeChat[0].id}`
              : undefined
          "
        >
          {{ $t("component.videoCard.openScriptEditor") }}
        </h-btn>
        <div class="h-6 w-2 bg-primary opacity-60" />
        <h-btn v-if="!showVideo" small @click="loadVideo()">
          {{ $t("views.tlClient.menu.loadVideo") }}
        </h-btn>
        <h-btn v-if="showVideo" small @click="unloadVideo()">
          {{ $t("views.tlClient.menu.unloadVideo") }}
        </h-btn>
        <div class="h-6 w-2 bg-primary opacity-60" />
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
          :width="videoWidth + '%'"
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
            <video-player
              :video="{ id: mainID }"
              class="aspect-video rounded-xl"
              style="position: relative; height: 100%"
            />
          </div>
          <div
            v-if="showVideo"
            class="horizontal-resize-bar"
            @mousedown="resizeMouseDown($event, 0)"
          >
            <div class="hr-resize-core" />
          </div>
          <TldexChat
            v-if="mainID"
            :lang="TLLang.value"
            :video="{ id: mainID }"
            :video-id="mainID"
            :class="{
              'flex-shrink': true,
              'tl-full-height': false,
            }"
            :style="{ height: showVideo ? tlChatHeight + 'px' : '100%' }"
          />
          <!-- :use-local-subtitle-toggle="false" (TODO what does this do?) -->
        </div>
        <div
          v-if="activeChat.length > 0"
          class="vertical-resize-bar"
          @mousedown="resizeMouseDown($event, 1)"
        >
          <div class="vr-resize-core" />
        </div>
        <div
          v-if="activeChat.length > 0"
          class="chat-panel-container"
          :style="{ width: 100 - videoWidth + '%' }"
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
          <div
            v-for="(currentChat, index) in activeChat"
            :key="'_chat' + currentChat.id"
            class="flex flex-col"
            variant="outlined"
          >
            <div
              class="flex h-6 items-center"
              :class="{
                'bg-success text-success-content': currentChat.connected,
                'bg-error text-error-content': !currentChat.connected,
              }"
            >
              <span
                class="mx-auto text-sm"
                :class="{ 'cursor-pointer': !currentChat.connected }"
                @click="$router.push('/about/extensions')"
              >
                <kbd class="group badge-outline badge align-top">
                  {{ currentChat.id }}
                  <h-icon
                    class="i-fluent:plug-connected-checkmark-20-filled inline-block"
                    :class="currentChat.connected ? 'inline-block' : 'hidden'"
                    style="font-size: 18px"
                  />
                  <h-icon
                    :class="currentChat.connected ? 'hidden' : 'inline-block'"
                    class="i-fluent:warning-20-filled inline-block"
                    style="font-size: 18px"
                  />
                  <span
                    v-show="!currentChat.connected"
                    class="hidden group-hover:inline"
                  >
                    To relay TL, Holodex+ Extension is needed
                  </span>
                </kbd>
              </span>
              <h-btn
                class="btn-icon"
                ghost
                small
                icon="i-mdi:close-circle"
                @click="unloadChatAtIndex(index)"
              />
            </div>
            <iframe
              class="activeChatIFrame"
              :src="videoIDToChatEmbedURL(currentChat.id)"
              frameborder="0"
              @load="iframeHookup($event, currentChat.id)"
            />
          </div>
        </div>
      </div>
      <div
        class="flex flex-row gap-4 px-10"
        @keydown.up.exact="profileStore.prevProfile()"
        @keydown.down.exact="profileStore.nextProfile()"
        @keydown.tab.exact.prevent="profileStore.nextProfile()"
        @keydown.shift.tab.exact.prevent="profileStore.goToProfile(0)"
        @keydown.ctrl.0.exact.prevent="profileStore.goToProfile(0)"
        @keydown.ctrl.1.exact.prevent="profileStore.goToProfile(1)"
        @keydown.ctrl.2.exact.prevent="profileStore.goToProfile(2)"
        @keydown.ctrl.3.exact.prevent="profileStore.goToProfile(3)"
        @keydown.ctrl.4.exact.prevent="profileStore.goToProfile(4)"
        @keydown.ctrl.5.exact.prevent="profileStore.goToProfile(5)"
        @keydown.ctrl.6.exact.prevent="profileStore.goToProfile(6)"
        @keydown.ctrl.7.exact.prevent="profileStore.goToProfile(7)"
        @keydown.ctrl.8.exact.prevent="profileStore.goToProfile(8)"
        @keydown.ctrl.9.exact.prevent="profileStore.goToProfile(9)"
      >
        <h-card
          flat
          tile
          class="carousel-vertical carousel-center carousel mt-4 min-w-max max-w-xs grow"
          :class="{
            'h-12': !TLSetting,
            'h-full': TLSetting,
          }"
        >
          <b class="carousel-item line-clamp-1 whitespace-nowrap px-1">
            Profiles:
          </b>
          <div
            v-for="(prf, index) in profileStore.profiles"
            :id="'prf' + index"
            :key="'prf' + index"
            :class="{
              'active-profile bg-bgColor-200 text-primary-200':
                index === profileStore.activeProfileIdx,
            }"
            class="profile-element carousel-item line-clamp-1 whitespace-nowrap"
            style="border-right-width: 4px"
            @click="profileStore.goToProfile(index)"
          >
            {{ index + ". " + prf.name }}
          </div>
        </h-card>
        <div class="w-full grow">
          <h-row class="gap-2">
            <h-input
              v-model="inputString"
              placeholder="Type TL Here <Enter key to send>"
              outlined
              hide-details
              dense
              group-class="focus-within:outline outline-2 outline-offset-2 outline-primary rounded-sm z-10"
              @keypress.enter="addEntry()"
            >
              <template #input>
                <div
                  class="input-anchor border-1 input flex h-12 w-full flex-row border border-primary-800 bg-bgColor-500"
                >
                  <span class="prefix pl-0">
                    {{ profileStore.activeProfile.prefix }}
                  </span>
                  <input
                    id="tl-input"
                    type="text"
                    class="w-full bg-bgColor-500 focus:outline-none"
                    placeholder="Type TL Here <Enter key to send>"
                  />
                  <span class="suffix pr-0">
                    {{ profileStore.activeProfile.suffix }}
                  </span>
                </div>
              </template>
              <template #append>
                <h-btn class="btn-lg" @click="addEntry()">
                  {{ $t("views.tlClient.tlControl.enterBtn") }}
                </h-btn>
              </template>
            </h-input>
            <h-btn
              class="btn-secondary self-end"
              :style="{
                'border-radius': TLSetting ? '10px 10px 0 0' : '10px',
              }"
              @click="TLSetting = !TLSetting"
            >
              {{
                TLSetting
                  ? $t("views.tlClient.tlControl.hideSetting")
                  : $t("views.tlClient.tlControl.showSetting")
              }}
              <h-icon :class="TLSetting ? 'i-mdi:cog-off' : 'i-mdi:cog'" />
            </h-btn>
          </h-row>
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-12 height-0"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 height-0"
            leave-to-class="opacity-0 translate-y-12 "
          >
            <div
              v-if="TLSetting"
              class="card-bordered card bg-secondary bg-opacity-10 p-4 shadow-2xl"
              style="border-radius: 10px 0 10px 10px"
            >
              <div class="card-title">
                <span>
                  Current Profile [{{ profileStore.activeProfile.name }}]
                  Settings
                </span>
                <h-btn
                  class="btn-icon ml-auto"
                  ghost
                  small
                  icon="i-mdi:close-circle"
                  @click="TLSetting = false"
                />
                <h-tooltip placement="top">
                  <template #activator="{ activatorProps }">
                    <h-icon
                      class="i-mdi:keyboard my-auto block h-6 w-6 self-end"
                      v-bind="activatorProps"
                    />
                  </template>
                  <div
                    class="card card-compact gap-2 bg-bgColor-800 p-2 text-sm font-normal"
                  >
                    <b>Keyboard Shortcuts while typing in TL box</b>
                    <span>
                      <kbd class="kbd kbd-sm">▲</kbd>
                      /
                      <kbd class="kbd kbd-sm">▼</kbd>
                      to change Profiles
                    </span>
                    <span>
                      <kbd class="kbd kbd-sm">Ctrl</kbd>
                      +
                      <kbd class="kbd kbd-sm">[1~9]</kbd>
                      to quick switch to Profile 1 ~ 9.
                    </span>
                    <span>
                      <kbd class="kbd kbd-sm">Shift</kbd>
                      +
                      <kbd class="kbd kbd-sm">TAB</kbd>
                      /
                      <kbd class="kbd kbd-sm">Ctrl</kbd>
                      +
                      <kbd class="kbd kbd-sm">0</kbd>
                      to switch to Default Profile (0)
                    </span>
                  </div>
                </h-tooltip>
              </div>
              <h-row>
                <Waveform :video-id="mainID" />
              </h-row>
              <h-row class="gap-2">
                <div class="grow basis-4/5">
                  <h-row class="max-w-xl gap-2">
                    <h-input
                      v-model="
                        profileStore.profiles[profileStore.activeProfileIdx]
                          .prefix
                      "
                      :title="$t('views.tlClient.tlControl.prefix')"
                    />
                    <h-input
                      v-model="
                        profileStore.profiles[profileStore.activeProfileIdx]
                          .suffix
                      "
                      :title="$t('views.tlClient.tlControl.suffix')"
                    />
                  </h-row>
                  <div class="mt-2">
                    <div class="btn-group mr-2 mt-1">
                      <h-btn small @click="addProfile">
                        {{ $t("views.tlClient.tlControl.addProfile") }}
                      </h-btn>
                      <h-btn
                        small
                        @click="
                          profileStore.deleteProfile(
                            profileStore.activeProfileIdx,
                          )
                        "
                      >
                        {{ $t("views.tlClient.tlControl.removeProfile") }} ({{
                          profileStore.activeProfile.name
                        }})
                      </h-btn>
                    </div>
                    <div class="btn-group mt-1">
                      <h-btn small @click="profileStore.shiftActiveProfileUp()">
                        {{ $t("views.tlClient.tlControl.shiftUp") }}
                      </h-btn>
                      <h-btn
                        small
                        @click="profileStore.shiftActiveProfileDown()"
                      >
                        {{ $t("views.tlClient.tlControl.shiftDown") }}
                      </h-btn>
                    </div>
                  </div>
                </div>
                <h-input
                  v-model="localPrefix"
                  class="max-w-xs"
                  :explanation="`Will be used as prefix when sync-ing TLs to youtube chat. You're currently submitting ${TLLang.text} translation into TLdex. Use TLdex Room Settings at the top to change room language instead.`"
                  :title="$t('views.tlClient.tlControl.localPrefix')"
                />
              </h-row>
            </div>
          </transition>
        </div>
      </div>
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
                  @click="deleteChatBox(index)"
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
import { TL_LANGS, VIDEO_URL_REGEX } from "@/utils/consts";
import { getVideoIDFromUrl, videoCodeParser } from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import { useSiteStore } from "@/stores";
import { getVideoThumbnails } from "@/utils/functions";
import {
  useForceHideTopBarWhileActive,
  indicateShouldHideSideBar,
} from "@/hooks/common/navbars";
import { ProtoframePubsub } from "protoframe";
import { tlsyncProtocol } from "./functions";
import { useProfileStore } from "../new-editor/stores";

type ProtoConnection = ProtoframePubsub<{
  initiate: {
    body: {
      info?: string | undefined;
    };
    response: {
      state: "ok" | "failed";
    };
  };
  sendMessage: {
    body: {
      text: string;
    };
  };
}>;
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
    useForceHideTopBarWhileActive();
    indicateShouldHideSideBar();

    const router = useRouter();
    if (!site.user || !site.jwtToken) {
      router.push("/login");
    }

    const activeChat: Ref<
      {
        id: string;
        iframeElement?: HTMLIFrameElement;
        client?: ProtoConnection;
        connected: boolean;
      }[]
    > = ref([]);

    const profileStore = useProfileStore();

    return {
      user: site.user,
      jwt: site.jwtToken,
      site,
      activeChat,
      profileStore,
    };
  },
  data() {
    return {
      TL_LANGS,
      TLSetting: true,
      firstLoad: true,
      inputString: "",
      localPrefix: `[${TL_LANGS[0].value}] `,
      // ------ MODAL --------
      configModal: true,
      // ------ SETTING ------
      TLLang: { ...TL_LANGS[0] },
      mainID: "",
      mainStreamLink: "",
      collabLinks: [""],
      // ---- VISIBLILITY OF VIDEO ----
      showVideo: false,
      // ---- LAYOUT ----
      tlChatHeight: 200,
      videoWidth: 60,
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
    "profileStore.activeProfileIdx": function (nw: any) {
      document.getElementById("prf" + nw)?.scrollIntoView();
    },
    TLSetting() {
      setTimeout(() => {
        document
          .getElementsByClassName("active-profile")?.[0]
          ?.scrollIntoView();
      }, 400);
    },
  },
  mounted() {
    this.init();
    if (localStorage.getItem("Holodex-TLClient")) {
      const defaultSetting = JSON.parse(
        localStorage.getItem("Holodex-TLClient") as any,
      );
      if (defaultSetting.tlChatHeight) {
        this.tlChatHeight = defaultSetting.tlChatHeight;
      }
      if (defaultSetting.videoWidth) {
        this.videoWidth = defaultSetting.videoWidth;
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
    iframeHookup(event: Event, chatId: string) {
      // find the chat:
      const idx = this.activeChat.findIndex((c) => c.id === chatId);
      if (idx < 0) {
        console.log(`No active chat found for ${chatId}, kinda weird.`);
        return; //weird but okay.
      }
      this.activeChat[idx].iframeElement = event.target as HTMLIFrameElement;
      const client: ProtoConnection = ProtoframePubsub.parent(
        tlsyncProtocol,
        event.target as HTMLIFrameElement,
      );
      ProtoframePubsub.connect(client).then(
        () => {
          client
            .ask(
              "initiate",
              { info: "TLclient requesting connect w/ Holodex+ TLSYNC Relay" },
              1000,
            )
            .then(
              (res) => {
                if (res.state === "ok") {
                  this.activeChat[idx].connected = true;
                  this.activeChat[idx].client = client;
                } else {
                  this.activeChat[idx].connected = false;
                  this.activeChat[idx].client = client;
                }
              },
              (reason) => {
                console.error(
                  "Connected to Protoframe within Youtube Chat Iframe, timed out waiting for INIT response.",
                  reason,
                );
                this.activeChat[idx].connected = false;
                this.activeChat[idx].client = client;
              },
            );
        },
        (reason) => {
          console.error(
            "Failed to connect to Protoframe within Youtube Chat:",
            reason,
          );
        },
      );
    },
    addEntry() {
      if (!this.user || !this.jwt) {
        console.error("you're not logged in");
        return;
      }
      // SEND TO HOLODEX +
      const msg =
        this.profileStore.activeProfile.prefix +
        this.inputString +
        this.profileStore.activeProfile.suffix;
      this.activeChat.forEach((e) => {
        if (e.connected) {
          e.client?.tell("sendMessage", {
            text: this.localPrefix + msg,
          });
        }
      });

      const bodydt = {
        name: this.user.username,
        timestamp: Date.now(),
        message: msg,
        source: "user",
      };

      // SEND TO API
      backendApi
        .postTL({
          videoId: this.video?.id || "custom",
          jwt: this.jwt,
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
        const ytVideoId = link.match(VIDEO_URL_REGEX)?.groups?.id;
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
    addProfile() {
      let profileName = prompt(
        this.$t("views.tlClient.addProfilePanel.title"),
        this.$t("views.tlClient.addProfilePanel.inputLabel"),
      )?.trim();
      if (!profileName) {
        profileName = `Profile ${this.profileStore.profiles.length}`;
      }
      this.profileStore.addProfile(profileName);
    },
    deleteChatBox(idx: number) {
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
    promptAddChat() {
      const res = prompt(
        this.$t("views.tlClient.loadChatPanel.title") +
          ": " +
          this.$t("views.tlClient.loadChatPanel.inputLabel"),
        "https://youtube.com/watch?v=...",
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
              id: `TW_${StreamURL.id}`,
              iframeElement: undefined,
              client: undefined,
              connected: false,
            });
            break;
          }

          default: {
            this.activeChat.push({
              id: `YT_${StreamURL.id}`,
              iframeElement: undefined,
              client: undefined,
              connected: false,
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
            videoWidth: this.videoWidth,
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
          videoWidth: this.videoWidth,
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
          const xChange =
            ((event.clientX - this.resizePos) * 100) / window.innerWidth;
          this.resizePos = event.clientX;
          if (
            this.videoWidth + xChange > 75 ||
            this.videoWidth + xChange < 33
          ) {
            return;
          }
          this.videoWidth += xChange;
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
            this.$route.query.video as string,
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
  box-shadow:
    0px 0px 0px 0px rgba(0, 0, 0, 0.2),
    0px 0px 0px 0px rgba(0, 0, 0, 0.14),
    0px 0px 0px 0px rgba(0, 0, 0, 0.12);
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

.tl-topbar > * {
  text-transform: unset !important;
}

.horizontal-resize-bar {
  cursor: s-resize;
  min-height: 9px;
  background: var(--v-background-base);
}

.horizontal-resize-bar > .hr-resize-core {
  width: 10%;
  min-width: 40px;
  margin-left: auto;
  margin-right: auto;
  background: #444;
  height: 3px;
  border-radius: 2px;
  margin-top: 3px;
}

.vertical-resize-bar {
  cursor: e-resize;
  width: 9px;
}

.vertical-resize-bar > .vr-resize-core {
  height: 10%;
  min-height: 40px;
  margin-top: 40vh;
  margin-bottom: auto;
  background: #444;
  width: 3px;
  border-radius: 2px;
  margin-left: 3px;
}

.chat-panel-container {
  display: grid;

  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(50px, 1fr));
}
.profile-element {
  @apply border-transparent px-1;
}
.profile-element.active-profile {
  @apply border-r-primary-300;
}
</style>
