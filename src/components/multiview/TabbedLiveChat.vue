<template>
    <div style="width: 100%; height: 100%">
        <div class="d-flex flex-row align-center py-1">
            <v-btn icon small class="mx-2" @click="currentTab -= 1" :disabled="currentTab <= 0">
                <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
            </v-btn>
            <v-select
                :items="channels"
                v-model="currentTab"
                outlined
                hide-details
                class="tabbed-chat-select mx-3"
            ></v-select>
            <v-btn icon small class="mx-2" @click="currentTab += 1" :disabled="currentTab >= activeVideos.length - 1">
                <v-icon>{{ icons.mdiChevronRight }}</v-icon>
            </v-btn>
        </div>
        <template v-if="activeVideos.length && currentTab >= 0">
            <iframe
                :src="twitchChatLink"
                v-if="activeVideos[currentTab || 0].cellVideoType === 'twitch'"
                style="width: 100%; height: calc(100% - 32px)"
                frameborder="0"
            >
            </iframe>
            <WatchLiveChat
                v-else
                :video="activeVideos[currentTab || 0]"
                style="width: 100%; height: calc(100% - 32px)"
                :key="'wlc' + activeVideos[currentTab || 0].id"
                :showTL="showTL"
                :showTLFirstTime="showTLFirstTime"
                :showLiveChat="setShowChat"
                fluid
            />
        </template>
    </div>
</template>

<script lang="ts">
import WatchLiveChat from "@/components/watch/WatchLiveChat.vue";

export default {
    name: "TabbedLiveChat",
    components: {
        WatchLiveChat,
    },
    props: {
        activeVideos: {
            type: Array,
            required: true,
        },
        setShowTL: {
            type: Boolean,
            default: false,
        },
        setShowChat: {
            type: Boolean,
            default: false,
        },
        id: {
            type: [String, Number],
            required: true,
        },
    },
    data() {
        return {
            currentTab: 0,
            showTL: false,
            showTLFirstTime: false,
            newTL: 0,

            // showLiveChat: true,
        };
    },
    mounted() {
        this.currentTab = this.savedTab;
    },
    computed: {
        savedTab: {
            get() {
                if (
                    !this.$store.state.multiview.layoutContent[this.id] ||
                    !this.$store.state.multiview.layoutContent[this.id].currentTab
                ) {
                    return 0;
                }
                return this.$store.state.multiview.layoutContent[this.id].currentTab;
            },
            set(val) {
                const obj = this.$store.state.multiview.layoutContent[this.id];
                obj.currentTab = val;
                return this.$store.commit("multiview/setLayoutContentById", {
                    id: this.id,
                    content: obj,
                });
            },
        },
        twitchChatLink() {
            return `https://www.twitch.tv/embed/${this.activeVideos[this.currentTab || 0].id}/chat?parent=${
                window.location.hostname
            }${this.darkMode ? "&darkpopout" : ""}`;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
        channels() {
            return this.activeVideos.map((video, index) => {
                return {
                    text: video.channel.name.split(" ")[0],
                    value: index,
                };
            });
        },
    },
    watch: {
        currentTab() {
            // this.showTLFirstTime = false;
            this.savedTab = this.currentTab;
        },
        setShowTL(nw) {
            if (!this.showTLFirstTime) {
                this.showTLFirstTime = true;
                this.showTL = true;
                return;
            }
            this.showTL = nw;
        },
        activeVideos() {
            if (!this.activeVideos.length) {
                this.currentTab = 0;
            } else if (this.currentTab >= this.activeVideos.length) {
                this.currentTab = this.activeVideos.length - 1;
            }
        },
    },
};
</script>

<style>
/* Jank shrink select to 28px height */
.tabbed-chat-select.v-text-field--outlined > .v-input__control > .v-input__slot {
    min-height: 28px !important;
}
.tabbed-chat-select.v-text-field--outlined:not(.v-text-field--single-line) .v-select__selections {
    padding: 0;
}

.tabbed-chat-select .v-select__selections input {
    height: 28px;
}
.tabbed-chat-select .v-select__selections .v-select__selection--comma {
    margin: 0;
}
.tabbed-chat-select .v-input__append-inner {
    margin: 0px;
    margin-top: 2px;
}
</style>
