<template>
    <v-bottom-navigation
        :value="value"
        grow
        :input-value="active"
        :app="!isWatchPage"
        v-show="!isWatchPage"
        :scroll-threshold="10000"
        class="bottom-nav"
    >
        <template v-for="page in pages">
            <v-btn
                :value="page.path"
                :key="page.name"
                :to="page.path"
                class="nav-btn"
                style="background: transparent"
                @click.native="scrollToTop(page)"
            >
                <span>{{ page.name }}</span>
                <v-icon>{{ page.icon }}</v-icon>
            </v-btn>
        </template>
    </v-bottom-navigation>
</template>

<script lang="ts">
export default {
    name: "BottomNav",
    props: {
        pages: {
            required: true,
            type: Array,
        },
        active: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    data() {
        return {
            value: "/",
        };
    },
    computed: {
        isWatchPage() {
            return ["watch_id", "watch", "mugen-clips", "edit_video", "multiview"].includes(this.$route.name);
        },
    },
    methods: {
        scrollToTop(page) {
            if (page.path === this.$route.path) {
                window.scroll({
                    top: 0,
                    left: 0,
                    behavior: "smooth",
                });
            }
        },
    },
};
</script>

<style>
.nav-btn {
    font-weight: 400;
    height: inherit !important;
}
.nav-btn.v-btn--active {
    color: #64b5f6 !important;
}
.bottom-nav {
    /* iPhone X/iOS 11.2+ offset for gesture nav bar */
    padding-bottom: min(max(calc(env(safe-area-inset-bottom)), 2px), 16px);
    height: auto !important;
}
.bottom-nav > .nav-btn {
    padding-top: 0.4rem !important;
    padding-bottom: 0.2rem !important;
}
</style>
