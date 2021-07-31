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
        <LoadingOverlay :is-loading="status === STATUSES.LOADING" :show-error="status === STATUSES.ERROR" />
        <div v-if="status === STATUSES.COMPLETED">
            End of list
        </div>
    </div>
</template>

<script lang="ts">
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

export default {
    name: "InfiniteLoad",
    components: {
        LoadingOverlay,
    },
    props: {
        identifier: {
            type: [String, Number],
            default: +new Date(),
        },
        initVisible: {
            // initial visibility, set to FALSE to prevent page loading at start. Usually you want TRUE
            // unless you're *absolutely* sure the object is not going to be visible.
            default: true,
            type: Boolean,
        },
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
            isVisible: false, // always invisible at start
        };
    },

    watch: {
        identifier() {
            this.reset();
        },
    },
    mounted() {
        if (this.initVisible) this.emitEvent();
    },
    methods: {
        reset() {
            this.status = this.STATUSES.READY;
        },
        onIntersect(entries, observer, isIntersecting) {
            this.isVisible = isIntersecting;
            if (this.status === this.STATUSES.READY && isIntersecting) this.emitEvent();
        },
        emitEvent() {
            const loaded = () => {
                this.nextPage += 1;
                this.status = this.STATUSES.READY;
                setTimeout(() => {
                    if (this.status === this.STATUSES.READY && this.isVisible) this.emitEvent();
                }, 100);
            };
            const completed = () => {
                this.status = this.STATUSES.COMPLETED;
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
