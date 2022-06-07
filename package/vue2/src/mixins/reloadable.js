export default {
    data() {
        return {
            unsubscribe: null,
            isActive: true,
            lastFetch: 0,
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
                // Gets called from either Pull to Refresh reload function or in router Scroll behavior
                if (this.isActive && action.type === "reloadCurrentPage") {
                    // consume the event, and handle it
                    action.payload.consumed = true;

                    // on desktop do nothin on first load, let the main element handle it
                    if (!this.lastFetch && !this.$store.state.isMobile) {
                        this.lastFetch = +new Date();
                        return;
                    }

                    // throttle requests, only refresh after 30s has past since last refresh
                    if (+new Date() - this.lastFetch < 1000 * 30 && action.payload.source === "scrollBehavior") {
                        return;
                    }

                    // call the reload function
                    this.reload();

                    this.lastFetch = +new Date();
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
            // function is overloaded in the component importing this mixin
            // default is to do nothing when refresh is requested
        },
    },
};
