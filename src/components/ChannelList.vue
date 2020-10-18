<template>
    <v-row v-if="asCards">
        <v-col
            v-for="channel in channels"
            :key="channel.id"
            cols="12"
            sm="6"
            md="6"
            lg="4"
            xl="3"
        >
            <ChannelCard :channel="channel"></ChannelCard>
        </v-col>
    </v-row>
    <v-list three-line class="pa-0" v-else>
        <template v-for="(channel, index) in channels">
            <v-list-item
                v-if="channel"
                :key="channel.id"
                @click="$router.push(`/channel/${channel.id}`)"
            >
                <v-list-item-avatar size="55">
                    <ChannelImg :channel="channel" size="55" />
                </v-list-item-avatar>
                <ChannelInfo
                    :channel="channel"
                    :includeVideoCount="includeVideoCount"
                >
                    <ChannelSocials
                        :channel="channel"
                        class="ma-0 justify-start"
                        v-if="isXs"
                        @click="test"
                    />
                </ChannelInfo>
                <ChannelSocials :channel="channel" v-if="!isXs" />
            </v-list-item>
            <v-divider :key="'divider-' + index"></v-divider>
        </template>
    </v-list>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
import ChannelSocials from "@/components/ChannelSocials";
export default {
    name: "ChannelList",
    components: {
        ChannelImg,
        ChannelInfo,
        ChannelSocials,
        ChannelCard: () => import("@/components/ChannelCard"),
    },
    props: {
        channels: {
            type: Array,
            required: true,
        },
        asCards: {
            type: Boolean,
            default: false,
        },
        includeVideoCount: {
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
