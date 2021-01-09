<template>
    <div :key="identifier" v-intersect="onIntersect" class="d-flex justify-center py-4">
        <LoadingOverlay :isLoading="status === STATUSES.LOADING" :showError="status === STATUSES.ERROR" />
        <div v-if="status === STATUSES.COMPLETED">End of list</div>
    </div>
</template>

<script>
import LoadingOverlay from "@/components/common/LoadingOverlay";

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
            console.log(isIntersecting);
            if (!(this.status === this.STATUSES.READY && isIntersecting)) return;

            this.$on("$InfiniteLoad:loaded", () => {
                this.reset();
            });

            this.$on("$InfiniteLoad:completed", () => {
                this.status = this.STATUSES.COMPLETED;
            });

            this.$on("$InfiniteLoad:error", () => {
                this.status = this.STATUSES.ERROR;
            });

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

            this.$emit("infinite", $state);
            this.status = this.STATUSES.LOADING;
        },
    },
};
</script>

<style></style>
