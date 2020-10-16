<template>
    <div
        :style="`top: ${touchDistance}px; margin-top: -32px;`"
        class="d-flex justify-center align-center pull-down"
    >
        <v-progress-circular
            :indeterminate="status == 1"
            :value="touchDistance * (70 / 90) + 20"
            size="32"
            class="ma-auto"
        ></v-progress-circular>
    </div>
</template>

<script>
export default {
    data() {
        return {
            canPull: false,
            isLoading: false,
            offset: 32,
            touchDistance: 0,
            touchStart: 0,
            status: 0,
        };
    },
    mounted() {
        console.log("set");
        this.$on("$PullDownRefresh:done", () => {
            this.reset();
        });
        this.$nextTick(() => {
            var html = document.querySelector("html");
            window.addEventListener(
                "touchstart",
                e => {
                    if (window.scrollY === 0) {
                        this.canPull = true;
                    } else {
                        this.canPull = false;
                    }
                    this.touchStart = e.touches.item(0).pageY;
                },
                { passive: true }
            );
            window.addEventListener(
                "touchmove",
                e => {
                    if (!this.canPull) {
                        return;
                    }
                    var distance = e.touches.item(0).pageY - this.touchStart;
                    // limit the height of pull down to 180
                    distance = distance > 90 ? 90 : distance;
                    // prevent native scroll
                    if (distance > 0) {
                        html.style.overflowY = "hidden";
                    }
                    // update touchPosition and the height of pull down
                    this.touchDistance = distance;
                },
                { passive: true }
            );
            const done = () => {
                this.$emit("$PullDownRefresh:done", { target: this });
            };
            // eslint-disable-next-line no-unused-vars
            window.addEventListener("touchend", e => {
                this.canPull = false;
                html.style.overflowY = "auto";
                // eslint-disable-next-line prettier/prettier
                if (this.touchDistance >= 80) {
                    this.isLoading = true;
                    this.status = 1;
                    this.$emit("refresh", done);
                } else {
                    this.reset();
                }
            });
        });
    },
    methods: {
        reset() {
            this.touchDistance = 0;
            this.touchStart = 0;
            this.status = 0;
            this.isLoading = false;
        },
    },
};
</script>

<style>
.pull-down {
    transition: all 0.2s ease;
    left: calc(50% - 16px);
    top: 0;
    position: absolute;
    z-index: 3;
}
</style>
