<template>
    <v-list-item-content>
        <v-list-item-title>
            <div class="text-truncate">{{ channel.name }}</div>
            <div class="body-2">{{ channel.name_en }}</div>
        </v-list-item-title>
        <v-list-item-subtitle>
            {{ channel.subscriber_count / 1000 }}K Subscribers
            <span v-if="includeVideoCount">
                <br />
                {{ channel.video_count }} Videos •
                <router-link
                    :to="`channel/${channel.id}/clips`"
                    style="text-decoration: none; color:inherit;"
                >
                    {{ channel.clip_count }} Clips
                </router-link>
            </span>
        </v-list-item-subtitle>
        <v-list-item-subtitle v-if="includeSocials">
            <ChannelSocials :channel="channel" />
        </v-list-item-subtitle>
        <!-- <v-list-item-subtitle v-if="!!this.$slots.subtitle"> -->
        <slot></slot>
        <!-- </v-list-item-subtitle> -->
    </v-list-item-content>
</template>

<script>
import ChannelSocials from "@/components/ChannelSocials";

export default {
    components: {
        ChannelSocials,
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
    },
};
</script>

<style></style>
