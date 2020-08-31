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
                        <v-list-item-content>
                            <v-list-item-title class="text-h5">
                                {{ channel.name }}
                                <div class="text-subtitle-1">
                                    {{ channel.name_en }}
                                </div>
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                {{ channel.subscriber_count / 1000 }}K Subscribers
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action class="v-list-item-horizontal">
                            <v-btn icon large>
                                <v-icon color="#C4302B">mdi-youtube</v-icon>
                            </v-btn>
                            <v-btn icon large>
                                <v-icon color="#00ACEE">mdi-twitter</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-container>
            <v-container class="pa-0">
                <v-tabs v-model="tab" v-on:change="loadTabContent">
                    <v-tab>Videos</v-tab>
                    <v-tab>Clips</v-tab>
                    <v-tab>Mentions</v-tab>
                    <v-tab>About</v-tab>
                </v-tabs>
            </v-container>
        </v-card>
        <v-container class="channel pa-0" style="min-height: 85vh">
            <VideoCardList :videos="videos" dense v-if="tab === 0" />
            <VideoCardList
                :videos="videos"
                dense
                v-if="tab === 1 || tab === 2"
                includeChannel
            />
            <div v-if="tab == 3" style="white-space: pre;">
                {{ channel.description }}
            </div>
        </v-container>
    </v-container>
</template>

<script>
import VideoCardList from "@/components/VideoCardList";
import api from "@/utils/backend-api";

export default {
    name: "Channel",
    data() {
        return {
            channel_id: null,
            videos: [],
            channel: {},
            tab: 0,
        };
    },
    created() {
        this.channel_id = this.$route.params.id;
        this.loadTabContent(this.tab);
        api.channel(this.channel_id).then(res => (this.channel = res.data));
    },
    methods: {
        loadTabContent() {
            switch (this.tab) {
                case 1:
                    api.clips(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
                case 2:
                    api.mentions(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
                case 3:
                    break;
                default:
                    api.videos(this.channel_id).then(
                        res => (this.videos = res.data.videos)
                    );
                    break;
            }
        },
    },
    props: {},
    components: {
        VideoCardList,
    },
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
</style>
