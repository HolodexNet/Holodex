<template>
  <div class="d-flex flex-row" :class="{ 'with-author': !hideAuthor && !source.shouldHideAuthor}">
    <div v-if="source.is_vtuber && source.channel_id" style="min-width: 28px;" class="mr-2">
      <channel-img
        v-if="!hideAuthor && !source.shouldHideAuthor"
        class="align-self-center"
        :channel="{ id: source.channel_id, name: source.name }"
        :size="28"
        rounded
      />
    </div>
    <div style="flex-basis: 100%;">
      <div
        v-if="!hideAuthor && !source.shouldHideAuthor"
        :class="{
          'tl-caption': true,
          'primary--text': source.is_owner,
          'secondary--text': !source.is_owner && (source.is_verified || source.is_moderator || source.is_vtuber),
        }"
      >
        <span class="tl-name" @click="showBlockChannelDialog = true">
          <!-- <span v-if="source.is_owner">👑</span> -->
          <span v-if="source.is_vtuber">[Vtuber]</span>
          <span v-if="source.is_moderator">[Mod]</span>
          <span v-if="source.source">{{ source.source }} - </span>{{ source.name }}<span v-if="source.is_verified" style="font-weight: 800"> ✓</span>:
          <v-icon x-small style="position: absolute; margin-top: 2px; margin-left: 1px;">{{ icons.mdiCog }}</v-icon>
        </span>
      </div>
      <a class="tl-message" :data-time="source.relativeSeconds">
        <span v-if="source.timestamp" class="tl-caption mr-1">
          {{ liveTlShowLocalTime ? source.realTime : source.displayTime }}
        </span>
        <span class="text--primary" v-html="source.message" />
      </a>
    </div>
    <v-dialog v-if="!hideAuthor && !source.shouldHideAuthor" v-model="showBlockChannelDialog" width="500">
      <v-card>
        <v-card-title>{{ source.name }}</v-card-title>
        <v-card-text>
          <v-btn
            v-if="source.channel_id"
            :href="`https://youtube.com/channel/${source.channel_id}`"
            target="_blank"
            class="mr-1"
            color="red"
          >
            <v-icon>
              {{ icons.mdiYoutube }}
            </v-icon> Youtube
          </v-btn>
          <v-btn
            v-if="source.channel_id && source.is_vtuber"
            :href="`https://holodex.net/channel/${source.channel_id}`"
            target="_blank"
            class="mr-1"
            color="secondary"
          >
            Holodex
          </v-btn>
          <v-btn @click="toggleBlockName(source.name)">
            {{ !blockedNames.has(source.name) ? "Block Channel" : "Unblock" }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mapState } from "vuex";
import ChannelImg from "../channel/ChannelImg.vue";

export default {
    name: "ChatMessage",
    components: { ChannelImg },
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

.tl-name {
  cursor: pointer;
}
.tl-name .v-icon {
  opacity: 0;
}

.tl-name:hover .v-icon {
  opacity: 1;
}

.with-author {
  border-top: 1px solid #ffffff1f;
  margin-top: 4px;
  padding-top: 4px;
}
</style>
