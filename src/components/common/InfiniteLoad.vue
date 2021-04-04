<template>
    <div :key="identifier" v-intersect="onIntersect" class="d-flex justify-center py-4" style="min-height: 100px">
        <LoadingOverlay :isLoading="status === STATUSES.LOADING" :showError="status === STATUSES.ERROR" />
        <div v-if="status === STATUSES.COMPLETED">End of list</div>
    </div>
</template>

<script lang="ts">
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

export default {
    name: "InfiniteLoad",
    components: {
        LoadingOverlay,
    },
    data() {
        return {
            STATUSES: Object.freeze({
                READY: 0,
                LOADING: 1,
                ERROR: 2,
                COMPLETED: 3,
            }),
            status: 0,
        };
    },
    props: {
        identifier: {
            default: +new Date(),
        },
        // emitFirstLoad: {
        //     default: false,
        //     type: Boolean,
        // },
    },
    mounted() {
        // this.emitFirstLoad && this.emitEvent();
    },
    watch: {
        identifier() {
            this.reset();
        },
    },
    methods: {
        reset() {
            this.status = this.STATUSES.READY;
        },
        // eslint-disable-next-line no-unused-vars
        onIntersect(entries, observer, isIntersecting) {
            if (!(this.status === this.STATUSES.READY && isIntersecting)) return;
            this.emitEvent();
        },
        emitEvent() {
            // event listeners for events defined below
            this.$on("$InfiniteLoad:loaded", () => {
                this.reset();
            });
            this.$on("$InfiniteLoad:completed", () => {
                this.status = this.STATUSES.COMPLETED;
            });

            this.$on("$InfiniteLoad:error", () => {
                this.status = this.STATUSES.ERROR;
            });

            // $state object to emit event to self
            const loaded = () => {
                this.$emit("$InfiniteLoad:loaded", { target: this });
            };
            const completed = () => {
                this.$emit("$InfiniteLoad:completed", { target: this });
            };
            const error = () => {
                this.$emit("$InfiniteLoad:error", { target: this });
            };

            const $state = {
                loaded,
                completed,
                error,
            };

            // pass $state to components
            this.$emit("infinite", $state);
            this.status = this.STATUSES.LOADING;
        },
    },
};
</script>

<style></style>
