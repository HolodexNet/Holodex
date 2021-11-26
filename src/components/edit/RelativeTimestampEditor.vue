<template>
  <div>
    <v-btn
      fab
      color="green"
      x-small
      class="ts-try-play"
      @click="$emit('test')"
    >
      <v-icon>{{ icons.mdiPlay }}</v-icon>
    </v-btn>
    <v-progress-linear
      color="green accent-3"
      :value="(Number(test) - min) * 100.0 / (max - min)"
      class="ts-progress"
    />
    <v-slider
      :value="value"
      :min="min"
      :max="max"
      height="12px"
      class="mb-2"
      :track-color="!upTo?'red':'gray accent-1'"
      :color="!upTo?'gray accent-1':'red'"
      thumb-color="red"
      hide-details
      ticks="always"
      @change="(x) => newVal = x"
      @end="setNewValue"
    >
      <template #thumb-label="{ value:cv }">
        {{ cv-value }}
      </template>
    </v-slider>
  </div>
</template>

<script>
export default {
    name: "TsEditor",
    props: {
        upTo: {
            type: Boolean,
            default: false,
        },
        value: {
            type: Number,
            required: true,
        },
        test: {
            type: Number,
            required: true,
        },
    },
    data() {
        return { newVal: this.value };
    },
    computed: {
        min() { return this.value - 4; },
        max() { return this.value + 4; },
    },
    methods: {
        setNewValue(n) {
            this.newVal = n;
            console.log(n);
            this.$emit("input", this.newVal);
        },
    },
};
</script>

<style>
.ts-progress {
    margin: 20px 8px -10px 8px;
    display: flex;
    width: auto !important;
    align-items: flex-start;
}
.ts-try-play {
    position: absolute;
    z-index: 1;
    margin-top:-14px;
}
</style>
