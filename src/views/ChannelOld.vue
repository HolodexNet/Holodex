<template>
    <v-container class="channel-container" fluid v-if="!isLoading && !showError">
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
                    <v-tab v-for="tab in tabs.filter((t) => !t.hide)" :key="tab.path" :to="tab.path" :exact="tab.exact">
                        {{ tab.name }}
                    </v-tab>
                </v-tabs>
            </v-container>
        </v-card>
        <v-container class="channel" style="min-height: 85vh">
            <router-view :channel="channel" :key="this.channel_id"></router-view>
        </v-container>
    </v-container>
    <LoadingOverlay :isLoading="isLoading" :showError="showError" v-else />
</template>

<script>
import api from "@/utils/backend-api";
import ChannelSocials from "@/components/channel/ChannelSocials";
import ChannelInfo from "@/components/channel/ChannelInfo";
import ChannelImg from "@/components/channel/ChannelImg";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { getBannerImages } from "@/utils/functions";

export default {
    name: "Channel",
    metaInfo() {
        return {
            title: this.metaTitle,
            meta: [
                {
                    vmid: "description",
                    name: "description",
                    property: "og:description",
                    content: this.metaDescription,
                },
                {
                    vmid: "image",
                    name: "image",
                    content: this.metaImage,
                },
                {
                    vmid: "url",
                    property: "og:url",
                    content: `https://holodex.net/channel/${this.channel_id}`,
                },
            ],
        };
    },
    components: {
        ChannelSocials,
        ChannelInfo,
        ChannelImg,
        LoadingOverlay,
    },
    data() {
        return {
            isLoading: true,
            showError: false,
            channel_id: null,
            videos: [],
            channel: {},
            tab: 0,
        };
    },
    mounted() {
        this.init();
    },
    computed: {
        bannerImage() {
            if (!this.channel.banner_image) {
                return "";
            }
            const { mobile, tablet } = getBannerImages(this.channel.banner_image);
            const banners = {
                xs: mobile,
                sm: tablet,
            };
            return banners[this.$vuetify.breakpoint.name] || tablet;
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
        channelName() {
            const prop = this.$store.state.nameProperty;
            if (this.channel[prop]) return this.channel[prop];
            return this.channel.name;
        },
        metaDescription() {
            return this.channel.description.substr(0, 100);
        },
        metaTitle() {
            return this.channelName;
        },
        metaImage() {
            return this.channel.photo;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.params.id": function () {
            this.init();
        },
    },
    methods: {
        init() {
            // reset component to default without recreating
            this.isLoading = true;
            this.channel_id = this.$route.params.id;
            this.videos = [];
            this.tab = 0;
            this.channel = {};
            return api
                .channel(this.channel_id)
                .then((res) => {
                    this.channel = res.data;
                })
                .then(() => {
                    // update cache with fresh data
                    this.$store.commit("addCachedChannel", this.channel);
                })
                .catch((e) => {
                    console.log(e);
                    this.showError = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<style>
.channel-container {
    padding: 0;
}

.channel-container > .v-card {
    border-radius: 0;
    margin-bottom: 1rem;
}

.v-list-item-horizontal {
    flex-direction: row;
    align-items: center;
    margin-right: 0 !important;
}

.channel-banner {
    height: calc(100vw / 6.2 - 1px);
}

.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
