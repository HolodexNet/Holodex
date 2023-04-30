<template>
  <div>Search Page Placeholder</div>
  <div>
    <search-chip
      v-for="(item, midx) in query"
      :key="'_sp_chip' + item.type + item.value + midx"
      :item="item"
      @click="query.splice(midx, 1)"
    />
  </div>
</template>
<script setup lang="ts">
import { getQueryFromQueryModel } from "@/components/nav/search/helper";
import {
  SearchableCategory,
  VideoQueryModel,
} from "@/components/nav/search/types";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  replace?: boolean; // if true, clicking it will replace the prior.
  _raw?: any;
};

const query = ref([] as Array<QueryItem>);

const route = useRoute();

watch(
  () => route.query,
  async () => {
    if (route.query) {
      query.value = await getQueryFromQueryModel(
        route.query as unknown as VideoQueryModel
      );
      console.log(JSON.stringify(route.query));
    }
  },
  { immediate: true }
);
</script>
