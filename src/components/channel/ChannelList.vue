<template>
    <v-row v-if="cardView" class="pa-0">
        <template v-for="(channel, index) in channels">
            <v-col
                cols="12"
                :key="`header-${index}`"
                class="pa-0"
                v-if="includeGroupHeader && (index === 0 || channels[index - 1].group !== channel.group)"
            >
                <v-subheader>
                    {{ channel.group ? channel.group : $t("component.channelList.otherText") }}
                </v-subheader>
            </v-col>
            <v-col :key="index" cols="12" sm="6" md="6" lg="4" xl="3" class="pa-2">
                <ChannelCard :channel="channel"></ChannelCard>
            </v-col>
        </template>
    </v-row>
    <v-list three-line class="pa-0" v-else>
        <template v-for="(channel, index) in channels">
            <v-subheader
                :key="'header-' + index"
                v-if="includeGroupHeader && (index === 0 || channels[index - 1].group !== channel.group)"
            >
                {{ channel.group ? channel.group : $t("component.channelList.otherText") }}
            </v-subheader>
            <v-list-item v-if="channel" :key="channel.id" :to="`/channel/${channel.id}`">
                <v-list-item-avatar size="55">
                    <ChannelImg :channel="channel" size="55" />
                </v-list-item-avatar>
                <ChannelInfo :channel="channel" :includeVideoCount="includeVideoCount">
                    <ChannelSocials :channel="channel" class="pa-0 justify-start" v-if="isXs" />
                </ChannelInfo>
                <ChannelSocials :channel="channel" v-if="!isXs" />
            </v-list-item>
            <v-divider :key="'divider-' + index"></v-divider>
        </template>
    </v-list>
</template>

<script>
import ChannelImg from "./ChannelImg";
import ChannelInfo from "./ChannelInfo";
import ChannelSocials from "./ChannelSocials";

export default {
    name: "ChannelList",
    components: {
        ChannelImg,
        ChannelInfo,
        ChannelSocials,
        ChannelCard: () => import("./ChannelCard"),
    },
    props: {
        channels: {
            type: Array,
            required: true,
        },
        cardView: {
            type: Boolean,
            default: false,
        },
        includeVideoCount: {
            type: Boolean,
            default: false,
        },
        includeGroupHeader: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isXs() {
            return this.$vuetify.breakpoint.width <= 410;
        },
    },
};
</script>

<style></style>
