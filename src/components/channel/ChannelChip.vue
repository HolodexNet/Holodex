<template>
    <!-- struggling a little bit with mobile/desktop compatibility -->
    <v-menu
        open-on-click
        open-on-focus
        :open-on-hover="!$store.state.isMobile"
        class=""
        top
        nudge-top="75"
        content-class="elevation-0"
        close-delay="250"
        v-model="isHover"
    >
        <template v-slot:activator="{ on: tooltip }">
            <v-avatar left size="70" v-on="tooltip">
                <v-img
                    :src="photo"
                    crossorigin="anonymous"
                    :alt="`${channel.name}'s profile picture`"
                    :width="size"
                    :height="size"
                />
                <v-fade-transition>
                    <v-overlay v-show="isHover" absolute class="chip-overlay">
                        <!-- <span class="channel-name-overlay">{{ channelName }}</span> -->
                        <v-btn icon
                            ><v-icon>{{ icons.mdiLoginVariant }}</v-icon></v-btn
                        >
                    </v-overlay>
                </v-fade-transition>
            </v-avatar>
        </template>
        <div class="channel-hover-tooltip">
            <ChannelSocials :channel="channel" vertical hideYt hideTwitter />
            <span class="grey--text text--lighten-1">{{ channelName }}</span>
        </div>
    </v-menu>

    <!-- </template>
    </v-hover> -->
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
        return { size: 80, isHover: false };
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
.channel-hover-tooltip {
    background-color: rgba(58, 58, 58, 0.7);
    display: flex;
    flex-direction: row;
    align-items: baseline;
    padding: 0 8px 0 0;
    margin-top: -3px;
    max-height: 32px;
    overflow: hidden;
}
</style>
