<template>
  <div class="p-4">
    <div class="flex w-full flex-row flex-wrap items-center p-4">
      <select
        v-model="container.pagination.sort"
        class="select-bordered select select-xs w-fit max-w-xs"
      >
        <option v-for="s in SORT_OPTIONS" :key="`_ssort_${s}`" :value="s">
          {{ s }}
        </option>
      </select>
      <div class="i-ion:filter mx-2 inline-block" />
      <search-chip
        v-for="(item, midx) in query"
        :key="'_sp_chip' + item.type + item.value + midx"
        :item="item"
      />
    </div>
    <video-card-grid hide-divider>
      <template v-for="hit in resp.data.value?.hits.hits || []">
        <video-card :video="hit._source as any" />
      </template>
    </video-card-grid>
  </div>
</template>
<script lang="ts" setup>
import {
  getQueryFromQueryModel,
  useSearch,
} from "@/components/nav/search/helper";
import {
  SearchableCategory,
  VideoQueryContainer,
  VideoQueryModel,
  SORT_OPTIONS,
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
        route.query as unknown as VideoQueryModel,
      );
      console.log(JSON.stringify(route.query));
    }
  },
  { immediate: true },
);

const container: Ref<VideoQueryContainer> = ref({
  pagination: {
    sort: "score",
    size: 24,
  },
} satisfies VideoQueryContainer);

const resp = useSearch(
  toRef(route, "query") as unknown as Ref<VideoQueryModel>,
  container,
);
</script>
