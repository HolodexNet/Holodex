<template>
    <div>
        <div :id="'tjump' + randomId"></div>
        <slot v-bind:data="data" v-bind:isLoading="isLoading"> </slot>
        <InfiniteLoad v-if="infiniteLoad" @infinite="emitLoad" :identifier="identifier" />
        <PaginateLoad
            v-if="paginate"
            :identifier="identifier"
            :pages="pages"
            @paginate="emitLoad"
            :pageLess="pageless || total === null"
            :scrollElementId="'tjump' + randomId"
        />
    </div>
</template>

<script lang="ts">
// Bridge type component:
/** =======================
 * *       INFO
 *
 *  Switches between Paginated and Scrollbased Loading mechanism at will.
 *  Accepts an input function to yield Promise<T> where T is :
 *  {
 *      total: count,
 *      offset: offset,
 *      <anyKey>: []
 *  }
 *  Or:
 *  {
 *      <anyKey>: [] <-- only usable with infinite or uncountable pages.
 *  }
 *  Or:
 *  [{object}] <-- only usable with infinite or uncountable pages.
 *
 *========================* */
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
        pageless: {
            type: Boolean,
            default: false,
        },
        /* only applicable if pageless, if true, then the infinite scrolling stops when a partial page is hit, 
        if false it'll stop on a empty page. */
        endIfPartialPage: {
            type: Boolean,
            default: false,
            required: false,
        },

        // load function, called with (offset, perPage) arg
        loadFn: {
            type: Function,
            default: false,
            required: true,
        },
        // how many to load per page.
        perPage: {
            type: Number,
            default: 24,
            required: false,
        },
    },
    data() {
        console.log("reset");
        return {
            randomId: Date.now(),

            data: [],
            total: null, // total, only known from the first request to loadFn

            // pagination/infinite key prop
            identifier: Date.now(),
            isLoading: true,
        };
    },
    computed: {
        pages() {
            return this.total ? Math.ceil(this.total / this.perPage) : 1;
        },
    },
    methods: {
        async emitLoad($state) {
            const { page } = $state;
            this.isLoading = true;
            const result: Array<Object> | { total?; offset?; items? } = await this.loadFn(
                (page - 1) * this.perPage,
                this.perPage,
            ).catch((x) => {
                $state.error(); // log the error and give up.
                console.error(x);
                return null;
            });

            if (!result) return;

            // find the iterative element:
            let obtainedArray: Array<Object>;
            let offset;

            if (Array.isArray(result)) {
                obtainedArray = result;
                this.total = null;
                offset = (page - 1) * this.perPage;
            } else {
                // well hopefully it's an object type.
                this.total = result.total;
                offset = result.offset || (page - 1) * this.perPage; // does offset actually matter? oh well.
                obtainedArray = Object.values(result as Object).find((v) => Array.isArray(v));
            }
            this.isLoading = false;
            // set output for slotted component
            if (this.infiniteLoad) {
                this.data = this.data.concat(obtainedArray);

                if ((obtainedArray.length < this.perPage && this.endIfPartialPage) || obtainedArray.length === 0) {
                    $state.completed(); // reached the end;
                } else {
                    $state.loaded(); // finished loading this batch.
                }
            } else if (this.paginate) {
                // in paginated mode.
                this.data = obtainedArray;
                if (this.pageless || this.total === null) {
                    if ((obtainedArray.length < this.perPage && this.endIfPartialPage) || obtainedArray.length === 0) {
                        $state.completed(); // reached the end;
                    } else {
                        $state.loaded(); // finished loading this batch.
                    }
                } else if ((offset || (page - 1) * this.perPage) + this.perPage >= this.total) {
                    $state.completed();
                } else {
                    $state.loaded();
                }
            }
        },
    },
};
</script>

<style></style>
