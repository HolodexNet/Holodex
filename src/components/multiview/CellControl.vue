<template>
  <div class="d-flex cell-control flex-wrap">
    <v-btn
      v-if="$listeners.back"
      small
      elevation="0"
      color="amber darken-2"
      class="return-btn mr-auto"
      @click="$emit('back')"
    >
      <v-icon right>
        {{ mdiArrowLeftCircle }}
      </v-icon>
    </v-btn>
    <v-btn
      v-if="$listeners.playpause"
      small
      elevation="0"
      color="primary"
      class="ml-2 px-md-8"
      @click="$emit('playpause')"
    >
      <v-icon>{{ playIcon }}</v-icon>
    </v-btn>
    <v-btn
      v-if="$listeners.reset"
      small
      elevation="0"
      color="secondary"
      class="ml-2 mr-0"
      @click="$emit('reset')"
    >
      <v-icon>{{ icons.mdiRefresh }}</v-icon>
    </v-btn>
    <v-hover v-slot="{ hover }">
      <v-btn
        small
        elevation="0"
        color="deep-orange darken-1"
        class="ml-auto mr-2"
        @click="$emit('delete')"
      >
        <v-icon>{{ hover ? mdiDeleteEmpty : icons.mdiDelete }}</v-icon>
      </v-btn>
    </v-hover>
  </div>
</template>

<script lang="ts">
import { mdiArrowLeftCircle, mdiDeleteEmpty } from "@mdi/js";

export default {
    props: {
        playIcon: {
            type: String,
        },
    },
    data() {
        return { mdiDeleteEmpty, mdiArrowLeftCircle };
    },
};
</script>

<style>
.mobile-helpers .cell-control {
  margin: 0 -5px;
}
.cell-control {
  margin: 0 -20px;
}
.mobile-helpers .cell-control .returnbtn {
  width: 25px;
  min-width: 40px;
}

.cell-control .v-btn {
  color: white;
}

.cell-control .return-btn {
    border-radius: 0 0 0 0;
    width: 60px;
    margin-right: 10px;
    position: relative;
}

.return-btn::after {
    transition: width 0.1s, right 0.1s;

    content: "";
    width: 10px;
    position: absolute;
    right: -8px;
    background-color: inherit;
    height: 100%;
    border-radius: 0 6px 6px 0;
}
.return-btn:hover::after {
    content: "";
    width: 18px;
    position: absolute;
    right: -16px;
    background-color: inherit;
    height: 100%;
    border-radius: 0 6px 6px 0;
}
</style>
