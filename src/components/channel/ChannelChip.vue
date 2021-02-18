<template>
    <!-- <v-chip pill :to="`/channel/${channel.id}`" class="channel-chip"> -->
    <v-hover>
        <template v-slot:default="{ hover }">
            <v-avatar rounded left size="70">
                <v-sheet>
                    <v-img
                        :src="photo"
                        crossorigin="anonymous"
                        :alt="`${channel.name}'s profile picture`"
                        :width="size"
                        :height="size"
                    />
                    <v-overlay v-if="hover" absolute color="#222" opacity="0.9" class="chip-overlay">
                        <span class="channel-name-overlay">{{ channelName }}</span>
                        <ChannelSocials :channel="channel" />
                    </v-overlay>
                </v-sheet>
            </v-avatar>
        </template>
    </v-hover>
</template>

<script>
import { resizeChannelPhoto } from "@/utils/functions";
import ChannelSocials from "@/components/channel/ChannelSocials";
import ChannelImg from "./ChannelImg";

export default {
    name: "ChannelChip",
    components: {
        ChannelImg,
        ChannelSocials,
    },
    props: {
        channel: {
            type: Object,
            required: true,
        },
        // close: {
        //     type: Boolean,
        //     required: false,
        // },
    },
    data() {
        return { size: 80 };
    },
    computed: {
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            if (this.channel[prop]) return this.channel[prop];
            return this.channel.name;
        },
        photo() {
            if (!this.channel.photo) return "";
            return resizeChannelPhoto(this.channel.photo, this.size);
        },
    },
};
</script>

<style>
.channel-name-overlay {
    font-size: 9px;
    line-height: 1.4;
    padding: 6px 3px 0 3px;
    margin-bottom: 3px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    white-space: initial;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: -webkit-box;
    text-decoration: underline;
    cursor: pointer;
}
.chip-overlay .channel-social-horizontal {
    padding: 0px;
    transform: scale(0.8);
    width: 100%;
}
</style>
