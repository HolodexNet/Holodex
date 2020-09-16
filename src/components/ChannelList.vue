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
                @click="$router.push(`/channel/${channel.id}`)"
                :key="channel.id"
            >
                <v-list-item-avatar size="55">
                    <ChannelImg :src="channel.photo" size="55" />
                </v-list-item-avatar>
                <ChannelInfo
                    :channel="channel"
                    :includeVideoCount="includeVideoCount"
                />
                <ChannelSocials
                    :channel="channel"
                    :vertical="$vuetify.breakpoint.width < 400"
                />
            </v-list-item>
            <v-divider :key="'divider-' + index"></v-divider>
        </template>
    </v-list>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
import ChannelSocials from "@/components/ChannelSocials";
import ChannelCard from "@/components/ChannelCard";
export default {
    name: "ChannelList",
    components: {
        ChannelImg,
        ChannelInfo,
        ChannelSocials,
        ChannelCard,
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
};
</script>

<style></style>
