<template>
    <v-bottom-navigation :value="value" grow app>
        <template v-for="page in pages">
            <v-btn :value="page.path" :key="page.name" :to="page.path" class="nav-btn">
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
    },
    data() {
        return {
            value: "/",
        };
    },
};
</script>

<style>
.nav-btn {
    font-size: 0.875rem;
    font-weight: 400;
}
</style>
