<template>
  <v-container fluid class="pa-0">
    <v-container
      v-for="videoList in videoLists"
      :key="videoList.title"
      fluid
      class="pa-0"
    >
      <v-row
        v-if="videoList.videos.length"
        style="font-size: 1rem !important; font-weight: 500"
        class="my-2 ml-0"
      >
        {{ videoList.title }}
      </v-row>
      <VideoCardList
        :videos="videoList.videos"
        include-channel
        :cols="{
          xs: 1,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6,
        }"
      />
      <v-divider v-if="videoList.videos.length" class="my-5" />
    </v-container>
  </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";

export default {
    name: "FavoritesVideoList",
    components: {
        VideoCardList,
    },
    props: {
        videoLists: {
            type: Array,
            required: true,
        },
    },
};
</script>

<style></style>
