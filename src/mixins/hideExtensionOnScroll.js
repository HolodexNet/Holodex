export default {
    data() {
        return {
            previousScroll: 0,
            isScrollingUp: false,
            currentScroll: 0,
            savedScroll: 0,
            computedScrollThreshold: 100,
            showExt: true,
        };
    },
    computed: {
        modeled: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit("input", val);
            },
        },
        disableExt() {
            return !(this.$vuetify.breakpoint.xs && ["home", "channels", "favorites"].includes(this.$route.name));
        },
    },
    watch: {
        isScrollingUp() {
            this.savedScroll = this.savedScroll || this.currentScroll;
        },
        showExt() {
            this.savedScroll = 0;
            // this.$store.commit("setShowExtension", this.showExt);
        },
    },
    methods: {
        onScroll() {
            if (this.disableExt) return;

            if (window.scrollY === 0) {
                this.showExt = true;
            }
            this.previousScroll = this.currentScroll;
            this.currentScroll = this.target ? this.target.scrollTop : window.pageYOffset;

            this.isScrollingUp = this.currentScroll < this.previousScroll;
            this.currentThreshold = Math.abs(this.currentScroll - this.computedScrollThreshold);

            this.$nextTick(() => {
                if (Math.abs(this.currentScroll - this.savedScroll) > this.computedScrollThreshold) this.thresholdMet();
            });
        },
        thresholdMet() {
            this.showExt = this.isScrollingUp || this.currentScroll < this.computedScrollThreshold;
        },
    },
};
