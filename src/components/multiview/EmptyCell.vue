<template>
  <!-- When Cell has no content: show video picker -->
  <div class="cell-content pt-4">
    <!--================= No Content Mode ================-->
    <div class="centered-btn">
      <v-btn
        class="mr-2"
        color="indigo darken-1"
        rounded-sm
        large
        @click="$emit('showSelector', item.i)"
      >
        <v-icon>{{ mdiCardPlus }}</v-icon>
      </v-btn>
      <v-btn
        color="teal darken-1"
        rounded-sm
        large
        @click="setItemAsChat(item)"
      >
        <v-icon>{{ icons.ytChat }}</v-icon>
      </v-btn>
    </div>
    <CellControl :play-icon="icons.mdiPlay" class="mx-6 mb-6" @delete="deleteCell" />
  </div>
</template>

<script class="ts">
import { mdiCardPlus } from "@mdi/js";
import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

export default {
    components: {
        CellControl,
    },
    mixins: [CellMixin],
    data() {
        return {
            mdiCardPlus,
        };
    },
    methods: {
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.centered-btn {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;

    .v-btn {
      color: white !important;
    }
}
</style>
