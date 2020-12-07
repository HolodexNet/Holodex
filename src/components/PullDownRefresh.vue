<template>
    <div
        :style="`top: ${touchDistance}px;`"
        class="d-flex justify-center align-center pull-down"
        :class="{ 'show-pull-down': status !== STATUSES.READY }"
    >
        <v-progress-circular
            :indeterminate="status === STATUSES.REFRESHING"
            :value="touchDistance * 2"
            size="32"
            class="ma-auto"
            color="primary"
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
            STATUSES: {
                READY: 0,
                DRAGGING: 1,
                REFRESHING: 2,
            },
            touchStartHandler: null,
            touchMoveHandler: null,
            touchEndHandler: null,
        };
    },
    mounted() {
        this.$on("$PullDownRefresh:done", () => {
            this.reset();
        });
        const html = document.querySelector("html");
        const done = () => {
            this.$emit("$PullDownRefresh:done", { target: this });
        };
        this.touchStartHandler = (e) => {
            this.canPull = window.scrollY === 0;
            this.touchStart = e.touches.item(0).pageY;
        };
        this.touchMoveHandler = (e) => {
            if (!this.canPull || this.isLoading) {
                return;
            }
            this.status = this.STATUSES.DRAGGING;
            let distance = e.touches.item(0).pageY - this.touchStart;
            // limit the height of pull down to 180
            distance = distance > 90 ? 90 : distance;
            // prevent native scroll
            if (distance > 0) {
                html.style.overflowY = "hidden";
            }
            // update touchPosition and the height of pull down
            this.touchDistance = distance;
        };
        this.touchEndHandler = () => {
            html.style.overflowY = "auto";
            if (this.status === this.STATUSES.REFRESHING) return;
            if (this.touchDistance >= 80) {
                this.status = this.STATUSES.REFRESHING;
                this.$emit("refresh", done);
                this.canPull = false;
            } else {
                this.reset();
            }
        };
        window.addEventListener("touchstart", this.touchStartHandler, {
            passive: true,
        });
        window.addEventListener("touchmove", this.touchMoveHandler, {
            passive: true,
        });
        window.addEventListener("touchend", this.touchEndHandler);
    },
    activated() {
        console.log("hooked");
        // window.addEventListener("touchstart", this.touchStartHandler, {
        //     passive: true,
        // });
        // window.addEventListener("touchmove", this.touchMoveHandler, {
        //     passive: true,
        // });
        // window.addEventListener("touchend", this.touchEndHandler);
    },
    deactivated() {
        window.removeEventListener("touchstart", this.touchStartHandler, {
            passive: true,
        });
        window.removeEventListener("touchmove", this.touchMoveHandler, {
            passive: true,
        });
        window.removeEventListener("touchend", this.touchEndHandler);
    },
    methods: {
        reset() {
            this.touchDistance = 0;
            this.touchStart = 0;
            this.status = this.STATUSES.READY;
        },
    },
};
</script>

<style>
.pull-down {
    transition: top 0.2s ease, opacity 0.8s ease;
    left: calc(50% - 54px / 2);
    position: fixed;
    z-index: 3;
    padding: 6px;
    /* 32px + 6 + 6 = 54 */
    background-color: #f5f5f5;
    /* 54/2 */
    border-radius: 27px;
    /* margin-top: -54px; */
    opacity: 0;
}

.show-pull-down {
    opacity: 1;
}
</style>
