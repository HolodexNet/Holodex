<template>
    <v-container>
        <v-list three-line class="pa-0">
            <template v-for="(channel, index) in channels">
                <v-list-item
                    :key="channel.id"
                    @click="$router.push(`/channel/${channel.id}`)"
                >
                    <v-list-item-avatar size="50">
                        <ChannelImg :src="channel.photo" size="50" />
                    </v-list-item-avatar>
                    <ChannelInfo :channel="channel" />
                    <v-list-item-action class="v-list-item-horizontal">
                        <ChannelSocials :channel="channel" />
                    </v-list-item-action>
                </v-list-item>
                <v-divider :key="'divider-' + index"></v-divider>
            </template>
        </v-list>
    </v-container>
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
    },
    props: {
        channels: {
            type: Array,
            required: true,
        },
    },
};
</script>

<style>
.v-list-item-horizontal {
    flex-direction: row;
    align-self: center !important;
}
</style>
