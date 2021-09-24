<template>
  <!-- When Cell has no content: show video picker -->
  <div class="cell-content pt-4">
    <!--================= No Content Mode ================-->
    <div class="centered-btn">
      <v-btn
        class=""
        color="indigo darken-1"
        rounded-sm
        large
        @click="$emit('showSelector', item.i)"
      >
        <v-icon left>
          {{ mdiVideoPlus }}
        </v-icon> {{ $t('views.multiview.video.selectLive') }}
      </v-btn>
      <div class="mt-2">
        <v-btn
          class="mr-2"
          color="teal darken-1"
          rounded-sm
          large
          @click="setItemAsChat(item, false)"
        >
          <v-icon left>
            {{ icons.ytChat }}
          </v-icon>
          Chat
        </v-btn>
        <v-btn
          color="teal darken-1"
          rounded-sm
          large
          @click="setItemAsChat(item, true)"
        >
          <v-icon left>
            {{ icons.tlChat }}
          </v-icon>
          TL
        </v-btn>
      </div>
    </div>
    <CellControl :play-icon="icons.mdiPlay" class="mx-1 mb-2" @delete="deleteCell" />
  </div>
</template>

<script class="ts">
import { mdiVideoPlus } from "@mdi/js";
import CellMixin from "./CellMixin";
import CellControl from "./CellControl.vue";

export default {
    components: {
        CellControl,
    },
    mixins: [CellMixin],
    data() {
        return {
            mdiVideoPlus,
        };
    },
    methods: {
        setItemAsChat(item, initAsTL) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                    initAsTL,
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
    flex-direction: column;

    .v-btn {
      color: white !important;
    }
}
</style>
