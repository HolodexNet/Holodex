<template>
  <div :ref="source.breakpoint && 'messageBreakpoint'">
    <div
      v-if="!hideAuthor"
      :class="{
        'tl-caption': true,
        'primary--text': source.is_owner,
        'secondary--text': source.is_verified || source.is_moderator || source.is_vtuber,
      }"
    >
      <v-divider class="my-1" />
      <span style="cursor: pointer" @click="showBlockChannelDialog = true">
        <v-icon x-small>{{ icons.mdiCog }}</v-icon>
        {{ `${source.prefix} ${source.name}` }}:
      </span>
    </div>
    <a class="tl-message" :data-time="source.relativeSeconds">
      <span v-if="source.timestamp&&!liveTlShowLocalTime" class="tl-caption mr-1">
        {{ source.displayTime }}
      </span>
      <span v-else-if="source.timestamp&&liveTlShowLocalTime" class="tl-caption mr-1">
        {{ source.realTime }}
      </span>
      <span class="text--primary" v-html="source.message" />
    </a>
    <v-dialog v-if="!hideAuthor" v-model="showBlockChannelDialog" width="500">
      <v-card>
        <v-card-title>{{ source.name }}</v-card-title>
        <v-card-text>
          <v-btn @click="toggleBlockName(source.name)">
            {{ !blockedNames.has(source.name) ? "Block Channel" : "Unblock" }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "ChatMessage",
    props: {
        source: {
            type: Object,
            required: true,
        },
        index: {
            type: Number,
            default: 0,
        },
        hideAuthor: {
            type: Boolean,
        },
    },
    data() {
        return {
            showBlockChannelDialog: false,
        };
    },
    computed: {
        ...mapState("settings", [
            "liveTlShowLocalTime",
        ]),
        blockedNames() {
            return this.$store.getters["settings/liveTlBlockedNames"];
        },
    },
    methods: {
        toggleBlockName(name) {
            this.$store.commit("settings/toggleLiveTlBlocked", name);
        },
    },
};
</script>

<style>
.theme--light .tl-caption {
    color: hsla(0, 0%, 30%, 0.7);
}
.theme--dark .tl-caption {
    color: hsla(0, 0%, 70%, 0.7);
}

.tl-body .tl-caption {
    letter-spacing: 0.0333333333em !important;
    font-size: 0.85em;
}
</style>
