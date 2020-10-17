export default {
    props: {
        refreshId: {
            type: Number,
        },
    },
    watch: {
        refreshId() {
            this.onRefresh();
        },
    },
    methods: {
        finishReload() {
            this.$emit("refreshed", this.$route.fullPath);
        },
    },
};
