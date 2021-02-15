<template>
    <v-bottom-navigation :value="value" grow app :input-value="active" height="48" :scroll-threshold="1000">
        <template v-for="page in pages">
            <v-btn
                :value="page.path"
                :key="page.name"
                :to="page.path"
                class="nav-btn"
                @click.native="scrollToTop(page)"
            >
                <span>{{ page.name }}</span>
                <v-icon>{{ page.icon }}</v-icon>
            </v-btn>
        </template>
    </v-bottom-navigation>
</template>

<script>
export default {
    name: "BottomNav",
    props: {
        pages: {
            required: true,
            type: Array,
        },
        active: {
            type: Boolean,
            require: false,
            default: true,
        },
    },
    data() {
        return {
            value: "/",
        };
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
    font-size: 0.875rem;
    font-weight: 400;
    height: inherit !important;
}
</style>
