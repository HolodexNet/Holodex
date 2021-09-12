<template>
  <generic-list-loader
    v-slot="{ data, isLoading }"
    :key="id + type"
    paginate
    :per-page="pageLength"
    :load-fn="getLoadFn()"
  >
    <VideoCardList
      v-show="!isLoading"
      :videos="data"
      :include-channel="hasChannelInfo"
      :cols="cols"
      dense
    />
    <!-- Render skeleton items when data hasn't loaded yet -->
    <SkeletonCardList v-if="isLoading" :cols="cols" dense />
  </generic-list-loader>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import { mapState } from "vuex";
import backendApi from "@/utils/backend-api";
import GenericListLoader from "@/components/video/GenericListLoader.vue";
import SkeletonCardList from "@/components/video/SkeletonCardList.vue";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
        GenericListLoader,
        SkeletonCardList,
    },
    metaInfo() {
        const vm = this;
        return {
            get title() {
                let tab = "Videos";
                switch (vm.type) {
                    case "clips":
                        tab = vm.$t("views.channel.clips");
                        break;
                    case "collabs":
                        tab = vm.$t("views.channel.collabs");
                        break;
                    default:
                        tab = vm.$t("views.channel.video");
                }
                return vm.channelName
                    ? `${vm.channelName} - ${tab} - Holodex`
                    : "Loading...";
            },
        };
    },

    data() {
        return {
            identifier: +new Date(),
            pageLength: 24,
            cols: Object.freeze({
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }),
        };
    },
    computed: {
        ...mapState("channel", ["id", "channel"]),
        hasChannelInfo() {
            // get uploader name for videos not uploaded by current channel
            return (
                this.$route.name === "channel_clips"
                || this.$route.name === "channel_collabs"
            );
        },
        type() {
            switch (this.$route.name) {
                case "channel_clips":
                    return "clips";
                case "channel_collabs":
                    return "collabs";
                default:
                    return "videos";
            }
        },
        channelName() {
            const prop = this.$store.state.settings.nameProperty;
            return this.channel[prop] || this.channel.name;
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.name": function () {
            this.identifier = +new Date();
        },
    },
    methods: {
        getLoadFn() {
            // eslint-disable-next-line func-names
            return async (offset, limit) => {
                const res = await backendApi.channelVideos(this.id, {
                    type: this.type,
                    query: {
                        ...(this.channel.type !== "subber" && {
                            lang: this.$store.state.settings.clipLangs.join(","),
                        }),
                        ...(this.type === "clips" && {
                            status: "past",
                        }),
                        include: "clips,live_info",
                        limit,
                        offset,
                        paginated: true,
                    },
                });
                return res.data;
            };
        },
    },
};
</script>

<style></style>
