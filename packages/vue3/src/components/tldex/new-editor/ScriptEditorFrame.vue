<template>
  <PageContainer class="absolute inset-0 pt-4">
    <div class="parent">
      <div class="header mb-4">
        <div class="tl-topbar btn-group justify-start">
          <h-btn small to="/" icon="i-material-symbols:home-outline-rounded">
            {{ $t("component.mainNav.home") }}
          </h-btn>
          <div class="h-6 w-2 bg-primary opacity-60" />
          <h-btn no-color class="btn-secondary" small>
            {{ $t("views.tlClient.menu.setting") }}
          </h-btn>
          <div class="h-6 w-2 bg-primary opacity-60" />
          <h-btn
            small
            no-color
            class="btn-secondary"
            @click="console.log('save')"
          >
            {{ $t("views.scriptEditor.menu.save") }}
            <kbd class="kbd kbd-xs ml-1 bg-transparent opacity-60">Ctrl+S</kbd>
          </h-btn>

          <!-- <h-btn small @click="console.log('show')">
            {{ $t("views.tlClient.menu.loadVideo") }}
          </h-btn>
          <h-btn small @click="console.log('hide')">
            {{ $t("views.tlClient.menu.unloadVideo") }}
          </h-btn> -->
          <div class="h-6 w-2 bg-primary opacity-60" />
          <h-btn small @click="console.log('show')">
            {{ $t("views.scriptEditor.menu.importFile") }}
          </h-btn>
          <h-btn small @click="console.log('hide')">
            {{ $t("views.scriptEditor.menu.exportFile") }}
          </h-btn>
          <div class="h-6 w-2 bg-primary opacity-60" />

          <h-btn
            small
            :class="{ 'btn-disabled disabled': !canUndo }"
            @click="undo"
          >
            Undo
          </h-btn>
          <h-btn
            small
            :class="{ 'btn-disabled disabled': !canRedo }"
            @click="redo"
          >
            Redo
          </h-btn>
        </div>
      </div>

      <div class="content">
        <!-- Main content goes here -->
        <video-player
          :video="{ id: videoId }"
          :refresh-interval-ms="20"
          class="h-full overflow-hidden rounded-xl"
        />
      </div>

      <div class="sidebar">
        <!-- Sidebar content goes here -->
        <editor-sidebar :room-id="roomId" />
      </div>

      <div class="tooling">
        <!-- tooling content goes here -->
        tooling {{ room?.messages.length }}
      </div>

      <div class="waveform">
        <!-- waveform content goes here -->
        <Waveform :video-id="videoId" :room="room" />
      </div>
    </div>
  </PageContainer>
</template>
<script lang="ts" setup>
import {
  useForceHideTopBarWhileActive,
  indicateShouldHideSideBar,
} from "@/hooks/common/navbars";
import { useSocket } from "@/stores/socket";
import { RoomIDString } from "@/stores/socket_types";
import { TLLanguageCode } from "@/utils/consts";
import { until, useDebouncedRefHistory } from "@vueuse/core";
import { klona } from "klona";

useForceHideTopBarWhileActive();
indicateShouldHideSideBar();

const videoId = ref("n-pNnnM2ERs");
const langId = ref<TLLanguageCode>("en");

const socket = useSocket();
const chatDB = socket.chatDB;
const roomId = computed<RoomIDString>(() => `${videoId.value}/${langId.value}`);
chatDB.loadMessages(roomId.value, {
  liveTlShowModerator: false,
  liveTlShowVerified: false,
  liveTlShowVtuber: false,
} as any);

const room = computed({
  get() {
    return chatDB.rooms.get(roomId.value as any);
  },
  set(r) {
    if (!r) return;
    chatDB.rooms.set(roomId.value as any, r);
  },
});

const messages = computed({
  get() {
    return chatDB.rooms.get(roomId.value as any)?.messages;
  },
  set(r) {
    if (!r) return;
    (chatDB.rooms.get(roomId.value as any) as any).messages = r;
  },
});

const { history, undo, canUndo, redo, canRedo, clear } = useDebouncedRefHistory(
  messages,
  {
    capacity: 50,
    deep: true,
    debounce: 5000,
    clone: klona,
  }
);
setTimeout(async () => {
  if (messages.value == undefined || messages.value.length == 0) {
    console.log("waiting for data...");
    until(messages)
      .toMatch((v) => !!v && v.length > 0)
      .then(() => {
        console.log("hey it's fine");
        clear();
      });
  }
  // console.log(messages.value, "is not undefined");
  clear(); // clear history once it has been loaded the first time.
}, 100);
</script>
<style scoped>
.highlight-border * {
  border: 1px solid white;
}
.tl-topbar {
  top: 0px;
  z-index: 1006;
  transform: translateY(0%);
  width: calc(100% + 0px);
  --v-theme-overlay-multiplier: var(--v-theme-secondary-overlay-multiplier);
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-on-secondary)) !important;

  align-items: center;
  display: flex;
  flex: 1 1 auto;
  max-width: 100%;
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
.tl-topbar > * {
  text-transform: unset !important;
}
.parent {
  @apply gap-2;
  display: grid;
  height: 100%;
  grid-template-columns: 3fr minmax(600px, 2fr);
  grid-template-rows: max-content 1fr 60px 200px;
  grid-template-areas:
    "header header"
    "content sidebar"
    "tooling sidebar"
    "waveform waveform";
}

.header {
  grid-area: header;
}
.content {
  grid-area: content;
}
.sidebar {
  grid-area: sidebar;
}
.tooling {
  grid-area: tooling;
}
.waveform {
  @apply overflow-hidden rounded-lg;
  grid-area: waveform;
}
</style>
