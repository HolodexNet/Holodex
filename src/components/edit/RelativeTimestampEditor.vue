<template>
  <div :class="'rel-ts '+(upTo?'rel-end':'rel-start') +' mb-4 pt-4'">
    <!-- <v-btn
      fab
      color="green"
      x-small
      class="ts-try-play"
      @click="$emit('test')"
    >
      <v-icon>{{ icons.mdiPlay }}</v-icon>
    </v-btn> -->
    <v-progress-linear
      color="red accent-3"
      background-color="grey accent-2"
      :value="((Number(test) - min) * 100.0) / (max - min)"
      class="ts-progress"
    />
    <div class="rel-current" style="">
      Play from here
    </div>
    <v-slider
      :value="value"
      :min="min"
      :max="max"
      height="12px"
      class="mb-2 rel-slider"
      :track-color="!upTo ? 'rel-fgC' : 'rel-bgC'"
      :color="!upTo ? 'rel-bgC' : 'rel-fgC'"
      thumb-color="red"
      thumb-label="always"
      tick-size="3px"
      hide-details
      ticks="always"
      @change="(x) => (newVal = x)"
      @end="setNewValue"
    >
      <template #thumb-label="{ value: cv }">
        {{ cv === value ? formatDuration(value*1000) : ((cv - value) > 0 ? '+' : '')+(cv - value)+'s' }}
      </template>
    </v-slider>
  </div>
</template>

<script>
import { formatDuration } from "@/utils/time";

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
        min() {
            return Math.max(0, this.value - 6);
        },
        max() {
            return Math.max(0, this.value + 6);
        },
    },
    methods: {
        setNewValue(n) {
            this.newVal = n;
            console.log(n);
            this.$emit("input", this.newVal);
        },
        formatDuration,
    },
};
</script>

<style lang="scss">
.ts-progress {
  margin: 20px 8px 6px 8px;
  display: flex;
  width: auto !important;
  align-items: flex-start;
}
.ts-try-play {
  position: absolute;
  z-index: 1;
  margin-top: -14px;
}

.rel-ts {
  margin-left: -10px;
  margin-right: -10px;

  &:hover .rel-current {
    display: block;
  }
  .rel-current {
    display: none;
  }

  .slider {
    margin-top: 12px;
  }

  .v-slider__track-container {
    height: 20px;

    .rel-bgC {
      background-color: #5555;
    }
    .rel-fgC {
      background: -moz-linear-gradient(
        top,
        rgb(138, 168, 54) 0%,
        rgb(71, 112, 32) 100%
      );
      background: -webkit-gradient(
        left top,
        left bottom,
        color-stop(0%, rgb(138, 168, 54)),
        color-stop(100%, rgb(71, 112, 32))
      );
      background: -webkit-linear-gradient(
        top,
        rgb(138, 168, 54) 0%,
        rgb(71, 112, 32) 100%
      );
      background: -o-linear-gradient(
        top,
        rgb(138, 168, 54) 0%,
        rgb(71, 112, 32) 100%
      );
      background: -ms-linear-gradient(
        top,
        rgb(138, 168, 54) 0%,
        rgb(71, 112, 32) 100%
      );
      background: linear-gradient(
        to bottom,
        rgb(138, 168, 54) 0%,
        rgb(71, 112, 32) 100%
      );
    }
  }
  .v-slider__ticks-container {
    height: 20px;
    cursor: col-resize;

    .v-slider__tick {
      height: 12px !important;
      top: 4px !important;
    }
  }

  .v-slider__thumb-container {
    cursor: e-resize;

    .v-slider__thumb {
      clip-path: polygon(12% 0%, 84% 0%, 84% 100%, 12% 100%, 42% 74%, 42% 26%);
      border-radius: 0;
      height: 22px;
      &:hover {
        background: rgb(230, 158, 158) !important;
      }
    }
    .v-slider__thumb-label-container .v-slider__thumb-label {
      transform: translate(-50%, 26px) !important;
      width: auto !important;
      height: 14px !important;
      border-radius: 3px;
      padding: 4px;

      & * {
        transform: unset !important;
      }
    }
  }

  &.rel-start .v-slider__thumb{
    transform: rotate(180deg);
    transform-origin: 6px 5.5px;
  }

  &.rel-end {
    .v-slider__tick--filled {
      background-color:rgba(0, 0, 0, 0.5) !important;
    }
    .v-slider__tick:not(.v-slider__tick--filled) {
      background-color:rgba(255, 255, 255, 0.5) !important;
    }
  }
}

</style>
