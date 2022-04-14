<template>
  <v-container fill-height />
</template>

<script lang="ts">
// import backendApi from "@/utils/backend-api";

export default {
    name: "TLManager",
    metaInfo() {
        return {
            get title() {
                return "TLManager - Holodex";
            },
        };
    },
    data() {
        return {

        };
    },
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
        user() {
            return this.$store.state.userdata.user;
        },
    },
    mounted() {
    },
    methods: {
    },
};
</script>

<style>
</style>
