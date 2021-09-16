<template>
  <v-autocomplete
    :search-input.sync="url"
    :label="slim ? hint : label"
    :hint="hint"
    :error="error"
    :hide-details="slim"
    :solo="slim"
    :append-outer-icon="icons.mdiCheck"
    :color="(url && !error) ? 'green' : (error ? 'warning' : '')"
    clearable
    disable-lookup
    hide-no-data
    :items="history"
    class="px-3"
    @click:append-outer="handleSubmit"
  />
</template>

<script>
import { getVideoIDFromUrl } from "@/utils/functions";

export default {
    name: "CustomUrlField",
    props: {
        twitch: {
            type: Boolean,
        },
        slim: {
            type: Boolean,
        },
    },
    data() {
        return {
            url: "",
            error: false,
        };
    },
    computed: {
        hint() {
            return this.twitch ? "https://www.twitch.tv/..." : "https://www.youtube.com/watch?v=...";
        },
        label() {
            return this.twitch ? "Twitch Channel Link" : "Youtube Video Link";
        },
        history() {
            const hist = this.twitch ? this.$store.state.multiview.twUrlHistory : this.$store.state.multiview.ytUrlHistory;
            return [...hist].reverse();
        },
    },
    watch: {
        twitch() {
            this.url = "";
            this.error = "";
        },
    },
    methods: {
        handleSubmit() {
            const content = getVideoIDFromUrl(this.url);
            if (content && content.id) {
                this.error = false;
                this.$emit("onSuccess", content);
                if (!this.history.includes(this.url)) this.addHistory(this.url);
                this.url = null;
            } else {
                this.error = true;
            }
        },
        addHistory(url) {
            this.$store.commit("multiview/addUrlHistory", { twitch: this.twitch, url });
        },
    },
};
</script>

<style></style>
