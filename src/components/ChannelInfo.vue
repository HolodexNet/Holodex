<template>
    <v-list-item-content>
        <v-list-item-title>
            <router-link
                :to="`/channel/${channel.id}`"
                class="no-decoration text-truncate"
            >
                {{ channelName }}
                <div
                    class="text-body-2 text--secondary"
                    v-if="!noGroup && channel.group"
                >
                    {{ channel.group }}
                </div>
            </router-link>
        </v-list-item-title>
        <v-list-item-subtitle>
            <template v-if="!noSubscriberCount">
                {{ subscriberCount }}
                <span class="green--text" v-if="subscriberGains">
                    {{ subscriberGains }}
                </span>
            </template>
            <template v-if="includeVideoCount">
                <br />
                {{ channel.video_count }} Videos
                <router-link
                    :to="`/channel/${channel.id}/clips`"
                    class="no-decoration"
                    v-if="channel.clip_count > 0"
                >
                    • {{ channel.clip_count }} Clips
                </router-link>
            </template>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="includeSocials">
            <ChannelSocials :channel="channel" />
        </v-list-item-subtitle>
        <slot></slot>
    </v-list-item-content>
</template>

<script>
// import ChannelSocials from "@/components/ChannelSocials";
import { formatCount } from "@/utils/functions";
export default {
    components: {
        ChannelSocials: () => import("@/components/ChannelSocials"),
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
    methods: {
        formatCount,
    },
    computed: {
        subscriberCount() {
            return `${formatCount(this.channel.subscriber_count)} Subscribers `;
        },
        subscriberGains() {
            return this.channel.subscriber_gains
                ? `(+${formatCount(this.channel.subscriber_gains)})`
                : null;
        },
        channelName() {
            const prop = this.$store.state.nameProperty;
            if (this.channel[prop]) return this.channel[prop];
            return this.channel.name;
        },
    },
};
</script>

<style>
.no-decoration {
    text-decoration: none;
    color: inherit;
    font-weight: 400 !important;
    font-size: inherit;
}
</style>
