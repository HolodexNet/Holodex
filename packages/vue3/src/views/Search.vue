<template>
  <div class="p-4">
    <div class="flex w-full flex-row flex-wrap items-center p-4">
      <div class="i-ion:filter mr-2 inline-block" />
      <search-chip
        v-for="(item, midx) in query"
        :key="'_sp_chip' + item.type + item.value + midx"
        :item="item"
        @click="query.splice(midx, 1)"
      />
    </div>
    <video-card-grid>
      <template
        v-for="(hit, index) in resp.data.value?.hits.hits || []"
        :key="hit._source.id + index + '_sid'"
      >
        <video-card :video="hit._source as any" />
      </template>
    </video-card-grid>
  </div>
</template>
<script setup lang="ts">
import {
  getQueryFromQueryModel,
  useSearch,
} from "@/components/nav/search/helper";
import {
  SearchableCategory,
  VideoQueryContainer,
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

const container: Ref<VideoQueryContainer> = ref({
  pagination: {
    sort: "score",
    size: 24,
  },
} satisfies VideoQueryContainer);

const resp = useSearch(
  toRef(route, "query") as unknown as Ref<VideoQueryModel>,
  container
);
</script>
