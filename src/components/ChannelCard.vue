<template>
    <v-card
        class="rounded-sm"
        tile
        @click="$router.push(`/channel/${channel.id}`)"
    >
        <v-list-item three-line>
            <v-list-item-avatar tile size="100">
                <ChannelImg :src="channel.photo" :size="100" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" includeVideoCount includeSocials />
        </v-list-item>
    </v-card>
</template>

<script>
import ChannelImg from "@/components/ChannelImg";
import ChannelInfo from "@/components/ChannelInfo";
export default {
    name: "ChannelCard",
    components: {
        ChannelImg,
        ChannelInfo,
    },
    props: {
        channel: {
            required: true,
            type: Object,
        },
        withLink: {
            required: false,
            type: Boolean,
        },
    },
};
</script>

<style></style>
