<template>
    <v-container class="channel-container" fluid>
        <v-card>
            <v-img :src="channel.banner_image" class="channel-banner" />
            <v-container>
                <v-list>
                    <v-list-item>
                        <v-list-item-avatar size="80">
                            <v-img :src="channel.photo"></v-img>
                        </v-list-item-avatar>
                        <!-- <v-list-item-content>
                            <v-list-item-title class="text-h5">
                                {{ channel.name }}
                                <div class="text-subtitle-1">
                                    {{ channel.name_en }}
                                </div>
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                {{ channel.subscriber_count / 1000 }}K Subscribers
                            </v-list-item-subtitle>
                        </v-list-item-content> -->
                        <!-- TODO: fix size!!! -->
                        <ChannelInfo :channel="channel" />
                        <v-list-item-action class="v-list-item-horizontal">
                            <ChannelSocials :channel="channel" />
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-container>
            <v-container class="pa-0">
                <v-tabs>
                    <v-tab :to="`/channel/${channel_id}/`" exact>Videos</v-tab>
                    <v-tab :to="`/channel/${channel_id}/clips`">Clips</v-tab>
                    <v-tab :to="`/channel/${channel_id}/mentions`">Mentions</v-tab>
                    <v-tab :to="`/channel/${channel_id}/about`">About</v-tab>
                </v-tabs>
            </v-container>
        </v-card>
        <v-container class="channel pa-0" style="min-height: 85vh">
            <router-view :channel="channel"></router-view>
        </v-container>
    </v-container>
</template>

<script>
import api from "@/utils/backend-api";
import ChannelSocials from "@/components/ChannelSocials";
import ChannelInfo from "@/components/ChannelInfo";
export default {
    name: "Channel",
    components: {
        ChannelSocials,
        ChannelInfo,
    },
    data() {
        return {
            channel_id: null,
            videos: [],
            channel: {},
            tab: 0,
            offset: 0,
        };
    },
    created() {
        this.channel_id = this.$route.params.id;
        api.channel(this.channel_id).then(res => (this.channel = res.data));
    },
    methods: {},
    props: {},
};
</script>

<style lang="scss">
.channel-container {
    padding: 0px;
}

.channel-container > .v-card {
    border-radius: 0;
    margin-bottom: 1rem;
}

.v-list-item-horizontal {
    flex-direction: row;
    align-items: center;
}

.channel-banner {
    height: calc(100vw / 6.2 - 1px);
}

.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
