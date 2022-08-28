<template>
  <v-autocomplete
    :value="value"
    :search-input.sync="search"
    :items="searchResults"
    hide-no-data
    clearable
    :label="label"
    @input="$emit('input', $event)"
  />
</template>

<script>
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import debounce from "lodash-es/debounce";

export default {
    name: "ChannelAutocomplete",
    props: {
        value: {
            type: Object,
        },
        label: {
            type: String,
            default: "Search Channels",
        },
    },
    data() {
        return {
            // selectedChannel: null,
            search: "",
            searchResults: [],
        };
    },
    watch: {
        // eslint-disable-next-line func-names
        search: debounce(function () {
            if (!this.search) {
                this.searchResults = [];
                return;
            }
            backendApi
                .searchChannel({
                    type: CHANNEL_TYPES.VTUBER,
                    queryText: this.search,
                })
                .then(({ data }) => {
                    this.searchResults = data.map((d) => ({
                        text: `${d.name.includes(`${d.english_name || d.name}`) ? this.getChannelName(d) : `${this.getChannelName(d)} / ${this.getInverseName(d)}`} (${d.id})`,
                        value: d,
                    }));
                });
        }, 500),
    },
    methods: {
        getChannelName(channel) {
            const prop = this.$store.state.settings.nameProperty;
            return channel[prop] || channel.name;
        },
        getInverseName(channel) {
            const prop = this.$store.state.settings.nameProperty === "name" ? "english_name" : "name";
            return channel[prop] || channel.name;
        },
    },
};
</script>

<style>

</style>
