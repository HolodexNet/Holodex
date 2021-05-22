<template>
    <div
        :key="identifier"
        v-intersect="{
            handler: onIntersect,
            options: {
                threshold: [0, 0.5, 1.0],
            },
        }"
        class="d-flex justify-center py-4"
        style="min-height: 100px"
    >
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
            nextPage: 1,
            isVisible: this.initVisible, // always visible at start
        };
    },
    props: {
        identifier: {
            default: +new Date(),
        },
        initVisible: {
            // initial visibility, set to FALSE to prevent page loading at start. Usually you want TRUE
            // unless you're *absolutely* sure the object is not going to be visible.
            default: true,
            type: Boolean,
        },
    },
    mounted() {
        if (this.isVisible) this.emitEvent();
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
        onIntersect(entries, observer, isIntersecting) {
            console.log(isIntersecting);
            this.isVisible = isIntersecting;
            if (this.status === this.STATUSES.READY && isIntersecting) this.emitEvent();
        },
        emitEvent() {
            const self = this;

            if (this.status !== this.STATUSES.READY || !this.isVisible) return;
            // if it's not ready to load, don't load.

            const loaded = () => {
                self.nextPage += 1;
                self.status = this.STATUSES.READY;
                setTimeout(self.emitEvent, 100);
            };
            const completed = () => {
                self.status = this.STATUSES.COMPLETED;
            };
            const error = () => {
                this.status = this.STATUSES.ERROR;
            };

            const $state = {
                loaded,
                completed,
                error,
                page: this.nextPage,
            };

            // pass $state to components
            this.$emit("infinite", $state);
            this.status = this.STATUSES.LOADING;
        },
    },
};
</script>

<style></style>
