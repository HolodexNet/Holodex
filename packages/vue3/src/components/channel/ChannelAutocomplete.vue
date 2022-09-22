<template>
  <v-autocomplete
    v-model:search="search"
    item-title="text"
    item-value="value"
    :items="searchResults"
    hide-no-data
    clearable
    :label="label"
    return-object
  />
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import { CHANNEL_TYPES } from "@/utils/consts";
import { watchDebounced } from "@vueuse/core";

export default defineComponent({
  name: "ChannelAutocomplete",
  props: {
    label: {
      type: String,
      default: "Search Channels",
    },
  },
  setup() {
    const search = ref("");
    const searchResults = ref([]);
    watchDebounced(
      search,
      () => {
        console.log("huh");
        if (!search.value) {
          searchResults.value = [];
          return;
        }
        backendApi
          .searchChannel(
            {
              type: CHANNEL_TYPES.VTUBER,
              queryText: search.value,
            },
            ""
          )
          .then(({ data }) => {
            searchResults.value = data.map((d) => ({
              text: `${d.english_name ? d.english_name + "," : ""} ${d.name} (${
                d.id
              })`,
              value: d,
            }));
          });
      },
      { debounce: 500, maxWait: 10000 }
    );

    return { search, searchResults };
  },
});
</script>

<style></style>
