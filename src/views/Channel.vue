<template>
    <v-container class="channel-container" fluid v-if="this.channel">
        <v-card>
            <v-img :src="bannerImage" class="channel-banner" />
            <v-container>
                <v-list>
                    <v-list-item>
                        <v-list-item-avatar :size="avatarSize">
                            <ChannelImg :size="avatarSize" :channel="channel" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="channel" />
                        <ChannelSocials :channel="channel" />
                    </v-list-item>
                </v-list>
            </v-container>
            <v-container class="pa-0">
                <v-tabs>
                    <v-tab
                        v-for="tab in tabs.filter(t => !t.hide)"
                        :key="tab.path"
                        :to="tab.path"
                        :exact="tab.exact"
                    >
                        {{ tab.name }}
                    </v-tab>
                </v-tabs>
            </v-container>
        </v-card>
        <v-container class="channel" style="min-height: 85vh">
            <router-view
                :channel="channel"
                :key="this.channel_id"
            ></router-view>
        </v-container>
    </v-container>
</template>

<script>
import api from "@/utils/backend-api";
import ChannelSocials from "@/components/ChannelSocials";
import ChannelInfo from "@/components/ChannelInfo";
import ChannelImg from "@/components/ChannelImg";
import { banner_images } from "@/utils/functions";

export default {
    name: "Channel",
    components: {
        ChannelSocials,
        ChannelInfo,
        ChannelImg,
    },
    data() {
        return {
            channel_id: null,
            videos: [],
            channel: null,
            tab: 0,
        };
    },
    mounted() {
        this.init();
    },
    computed: {
        bannerImage() {
            const b_images = banner_images(this.channel.banner_image);
            switch (this.$vuetify.breakpoint.name) {
                case "xs":
                    return b_images["mobile"];
                case "sm":
                    return b_images["mobile"];
                default:
                    return b_images["tablet"];
            }
        },
        avatarSize() {
            switch (this.$vuetify.breakpoint.name) {
                case "xs":
                    return 40;
                case "sm":
                    return 40;
                default:
                    return 80;
            }
        },
        tabs() {
            return [
                {
                    path: `/channel/${this.channel_id}/`,
                    name: "Videos",
                    exact: true,
                },
                {
                    path: `/channel/${this.channel_id}/clips`,
                    name: "Clips",
                    hide: this.channel_id > 1000,
                },
                {
                    path: `/channel/${this.channel_id}/collabs`,
                    name: "Collabs",
                    hide: this.channel_id > 1000,
                },
                { path: `/channel/${this.channel_id}/about`, name: "About" },
                { path: `/channel/${this.channel_id}/stats`, name: "Stats" },
            ];
        },
    },
    watch: {
        "$route.params.id"() {
            this.init();
        },
    },
    methods: {
        init() {
            // reset component to default without recreating
            this.channel_id = this.$route.params.id;
            (this.videos = []), (this.tab = 0), (this.channel = null);
            return api
                .channel(this.channel_id)
                .then(res => (this.channel = res.data));
        },
    },
};
</script>

<style>
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
    margin-right: 0px !important;
}

.channel-banner {
    height: calc(100vw / 6.2 - 1px);
}

.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
