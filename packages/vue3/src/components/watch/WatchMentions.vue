<template>
  <div>
    <a class="d-block text-overline mx-2 my-1">
      <v-icon small> {{ mdiAt }} </v-icon> Mentions
    </a>
    <v-card>
      <template v-for="mention in channelChips" :key="mention.id">
        <v-list-item
          class="d-flex flex-row align-center justify-space-between pa-1"
        >
          <channel-img :channel="mention" rounded />
          <v-list-item-content class="pl-2">
            {{ getChannelName(mention) }}
          </v-list-item-content>
          <ChannelSocials :channel="mention" vertical hide-yt hide-twitter />
        </v-list-item>
      </template>
      <a
        v-if="mentions.length > 3"
        style="white-space: pre"
        class="text-subtitle-2"
        @click="showAllMentions = !showAllMentions"
      >
        [ {{ showAllMentions ? "-" : "+" }} {{ mentions.length - 3 }} ]
      </a>
    </v-card>
  </div>
</template>

<script>
// import ChannelChip from "@/components/channel/ChannelChip.vue";
import { mdiAt } from "@mdi/js";
import ChannelSocials from "@/components/channel/ChannelSocials.vue";
import ChannelImg from "../channel/ChannelImg.vue";

export default {
  name: "WatchMentions",
  components: {
    // ChannelChip,
    ChannelImg,
    ChannelSocials,
  },
  props: {
    video: {
      type: Object,
      required: true,
      default: null,
    },
  },
  data() {
    return {
      showAllMentions: false,
      mdiAt,
    };
  },
  computed: {
    mentions() {
      return this.video?.mentions || [];
    },
    channelChips() {
      return this.mentions.length > 3 && !this.showAllMentions
        ? this.mentions.slice(0, 3)
        : this.mentions;
    },
  },
  methods: {
    getChannelName(channel) {
      const prop = this.$store.state.settings.nameProperty;
      return channel[prop] || channel.name;
    },
  },
};
</script>

<style></style>
