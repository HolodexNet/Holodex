<template>
  <v-list-item-content>
    <v-list-item-title style="align-self: flex-start">
      <router-link :to="`/channel/${channel.id}`" class="no-decoration text-truncate">
        {{ channelName }}
        <div class="text-body-2 text--secondary">
          {{ channel.org }} <span v-if="!noGroup && channel.group">• {{ channel.group }}</span>
        </div>
      </router-link>
    </v-list-item-title>
    <v-list-item-subtitle>
      <template v-if="!noSubscriberCount">
        {{ subscriberCount }}
      </template>
      <template v-if="includeVideoCount">
        •
        {{ $t("component.channelInfo.videoCount", [channel.video_count]) }}
        <router-link v-if="channel.clip_count > 0" :to="`/channel/${channel.id}/clips`" class="no-decoration">
          •
          <span class="primary--text">{{ $tc("component.channelInfo.clipCount", channel.clip_count) }}</span>
        </router-link>
      </template>
    </v-list-item-subtitle>
    <v-list-item-subtitle v-if="channel.top_topics && channel.top_topics.length">
      🏆
      <a
        v-for="topic in channel.top_topics"
        :key="topic"
        class="topic-chip"
        @click.exact.stop.prevent="searchTopic(topic)"
      >
        {{ topic }}
      </a>
    </v-list-item-subtitle>
    <v-list-item-subtitle v-if="includeSocials">
      <ChannelSocials :channel="channel" />
    </v-list-item-subtitle>
    <slot />
  </v-list-item-content>
</template>

<script lang="ts">
import { formatCount } from "@/utils/functions";
import { json2csvAsync } from "json-2-csv";

export default {
    components: {
        ChannelSocials: () => import("./ChannelSocials.vue"),
    },
    props: {
        channel: {
            type: Object,
            required: true,
        },
        includeSocials: {
            type: Boolean,
            default: false,
        },
        includeVideoCount: {
            type: Boolean,
            default: false,
        },
        noSubscriberCount: {
            type: Boolean,
            default: false,
        },
        noGroup: {
            type: Boolean,
            default: false,
        },
        // noLink: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    computed: {
        subscriberCount() {
            if (this.channel.subscriber_count) {
                return this.$tc(
                    "component.channelInfo.subscriberCount",
                    formatCount(this.channel.subscriber_count, this.$store.state.settings.lang),
                );
            }
            return this.$t("component.channelInfo.subscriberNA");
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            if (this.channel[prop]) return this.channel[prop];
            return this.channel.name;
        },
    },
    methods: {
        formatCount,
        async searchTopic(topicId) {
            const query = [
                { type: "channel", value: this.channel.id, text: this.channel.name },
                { type: "topic", value: topicId, text: topicId },
            ];
            this.$router.push({
                path: "/search",
                query: {
                    q: await json2csvAsync(query),
                },
            });
        },
    },
};
</script>

<style scoped>
/* .no-decoration {
    text-decoration: initial;
    color: initial;
    font-weight: 400 !important;
    font-size: inherit;
} */
.topic-chip {
    background-color: var(--v-background-darken3);
    padding: 2px 6px;
    border-radius: 1rem;
    text-decoration: none;
    text-transform: capitalize;
    margin-right: 4px;
    align-items: center;
    display: inline-flex;
    color: white;
}
.theme--dark .topic-chip {
    background-color: var(--v-background-lighten2);
    color: white;
}
.topic-chip:hover {
    background-color: var(--v-primary-base);
}
</style>
