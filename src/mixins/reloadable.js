export default {
    data() {
        return {
            unsubscribe: null,
            isActive: true,
            firstMount: true,
        };
    },
    activated() {
        this.isActive = true;
    },
    deactivated() {
        this.isActive = false;
    },
    mounted() {
        // listen to all actions
        this.unsubscribe = this.$store.subscribeAction(
            (action) => {
                // catch reloadCurrentPage action, if it's active
                if (this.isActive && action.type === "reloadCurrentPage") {
                    // consume the event, and handle it
                    action.payload.consumed = true;

                    // do nothin on first load, let the main element handle it
                    if (this.firstMount) {
                        this.firstMount = false;
                        return;
                    }

                    // call the reload function
                    this.reload();
                }
            },
            { prepend: true },
        );
    },
    beforeDestroy() {
        this.unsubscribe();
    },
    methods: {
        reload() {
            // this.$router.go(0);
        },
    },
};
