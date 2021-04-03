<template>
    <v-container class="channel-container" fluid v-if="!isLoading && !hasError">
        <v-card>
            <v-img v-if="bannerImage" :src="bannerImage" class="channel-banner" />
            <v-container :class="{ 'pa-0': isMobile, 'pa-1': !isMobile }">
                <v-list>
                    <v-list-item>
                        <v-list-item-avatar class="my-0" :size="avatarSize">
                            <ChannelImg :size="avatarSize" :channel="channel" />
                        </v-list-item-avatar>
                        <ChannelInfo :channel="channel" />
                        <ChannelSocials :channel="channel" showDelete />
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
            <router-view></router-view>
        </v-container>
    </v-container>
    <LoadingOverlay :isLoading="isLoading" :showError="hasError" v-else />
</template>

<script lang="ts">
// import api from "@/utils/backend-api";
import ChannelSocials from "@/components/channel/ChannelSocials.vue";
import ChannelInfo from "@/components/channel/ChannelInfo.vue";
import ChannelImg from "@/components/channel/ChannelImg.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import { getBannerImages } from "@/utils/functions";
import { mapState } from "vuex";

export default {
    name: "Channel",
    metaInfo() {
        const vm = this;
        return {
            title: `${vm.channelName} - Holodex`,
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
            tab: 0,
        };
    },
    created() {
        this.init();
    },
    computed: {
        ...mapState("channel", ["id", "channel", "isLoading", "hasError"]),
        ...mapState(["isMobile"]),
        bannerImage() {
            if (!this.channel.banner) {
                return "";
            }
            const { mobile, tablet } = getBannerImages(this.channel.banner);
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
                    path: `/channel/${this.id}/`,
                    name: "Videos",
                    exact: true,
                },
                {
                    path: `/channel/${this.id}/clips`,
                    name: "Clips",
                    hide: this.channel.type === "subber",
                },
                {
                    path: `/channel/${this.id}/music`,
                    name: "Music",
                    hide: this.channel.type === "subber",
                },
                {
                    path: `/channel/${this.id}/collabs`,
                    name: "Collabs",
                    hide: this.channel.type === "subber",
                },
                { path: `/channel/${this.id}/about`, name: "About" },
                // { path: `/channel/${this.channel_id}/stats`, name: "Stats" },
            ];
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            return this.channel[prop] || this.channel.name;
        },
        metaDescription() {
            return this.channel?.description?.substr(0, 100);
        },
        metaImage() {
            return this.channel.photo;
        },
    },
    methods: {
        init() {
            window.scrollTo(0, 0);
            this.$store.commit("channel/resetState");
            this.$store.commit("channel/resetVideos");
            this.$store.commit("channel/setId", this.$route.params.id);
            this.$store.dispatch("channel/fetchChannel");
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
    /* margin-bottom: 1rem; */
}

.v-list-item-horizontal {
    flex-direction: row;
    align-items: center;
    margin-right: 0 !important;
}

.channel-banner {
    height: 100px; /* legacy device support */
    height: calc(100vw / 6.2 - 1px);
}

.v-slide-group__prev--disabled {
    display: none !important;
}
</style>
