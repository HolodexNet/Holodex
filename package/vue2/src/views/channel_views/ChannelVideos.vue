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
      :cols="colSizes"
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
        };
    },
    computed: {
        currentGridSize: {
            get() {
                return this.$store.state.currentGridSize;
            },
            set(val) {
                this.$store.commit("setCurrentGridSize", val);
            },
        },

        colSizes() {
            return {
                xs: 1 + this.currentGridSize,
                sm: 2 + this.currentGridSize,
                md: 3 + this.currentGridSize,
                lg: 4 + this.currentGridSize,
                xl: 5 + this.currentGridSize,
            };
        },

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
                            type: "stream,placeholder",
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
                if (res.data.sort) {
                    // bubble live videos to the top of the sorting stack.
                    res.data.sort((a, b) => {
                        if (a.status !== b.status) {
                            if (a.status === "live") return -1;
                            if (b.status === "live") return 1;
                        }
                        return a.available_at - b.available_at;
                    });
                } else if (res.data.items.sort) {
                    // bubble live videos to the top of the sorting stack.
                    res.data.items.sort((a, b) => {
                        if (a.status !== b.status) {
                            if (a.status === "live") return -1;
                            if (b.status === "live") return 1;
                        }
                        return a.available_at - b.available_at;
                    });
                }
                return res.data;
            };
        },
    },
};
</script>

<style></style>
