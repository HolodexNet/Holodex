<template>
    <div>
        <slot v-bind:videos="{ videos }"> </slot>
        <InfiniteLoad v-if="true" @infinite="emitLoad" :identifier="identifier" />
        <PaginateLoad
            v-if="paginate"
            :identifier="identifier"
            :pages="paginatePages"
            @paginate="emitLoad"
            :pageLess="pageLess"
            :scrollElementId="'t' + randomId"
        />
    </div>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
// import api from "@/utils/backend-api";

export default {
    name: "ChannelVideos",
    components: {
        VideoCardList,
        InfiniteLoad: () => import("@/components/common/InfiniteLoad.vue"),
        PaginateLoad: () => import("@/components/common/PaginateLoad.vue"),
    },
    props: {
        // infinite load props
        infiniteLoad: {
            required: false,
            type: Boolean,
            default: false,
        },
        // pagination props
        paginate: {
            required: false,
            type: Boolean,
            default: false,
        },
        paginatePages: {
            type: Number,
            default: 1,
        },
        pageLess: {
            type: Boolean,
            default: false,
        },
        ignoreBlock: {
            type: Boolean,
            default: false,
        },
        loadFn: {
            type: Function,
            default: false,
            required: true,
        },
    },
    data() {
        return {
            randomId: Date.now(),
            pageLength: 24,

            videos: [],
            currentOffset: 0,
            total: 1,
            isLoading: true,
            hasError: false,

            // pagination/infinite key prop
            identifier: Date.now(),
        };
    },
    computed: {
        pages() {
            return Math.ceil(this.total / this.pageLength);
        },
        page: {
            get() {
                return this.currentPage;
            },
            set(val) {
                this.$emit("changePage", val, this.pageSize);
            },
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.name": function () {
            this.resetVideos();
        },
    },
    methods: {
        emitLoad($state) {
            this.$emit("load", $state);
        },
        resetVideos() {
            this.$store.commit("channel/resetVideos");
        },
    },
};
</script>

<style></style>
