<template>
  <div
    class="placeholder-overlay"
    :class="{ 'show-on-hover': showOnlyOnHover }"
  >
    <svg
      class="placeholder-svg"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >
      <!-- Diagonal lines -->
      <line
        :x1="0"
        :y1="0"
        :x2="width * 0.5"
        :y2="height * 0.5"
        class="placeholder-line"
      />
      <line
        :x1="width"
        :y1="0"
        :x2="width * 0.5"
        :y2="height * 0.5"
        class="placeholder-line"
      />
      <line
        :x1="0"
        :y1="height"
        :x2="width * 0.5"
        :y2="height * 0.5"
        class="placeholder-line"
      />
      <line
        :x1="width"
        :y1="height"
        :x2="width * 0.5"
        :y2="height * 0.5"
        class="placeholder-line"
      />

      <!-- Text in center -->
      <text
        :x="width / 2"
        :y="height / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        class="placeholder-text"
      >
        {{ text }}
      </text>
    </svg>
  </div>
</template>

<script>
export default {
    name: "PlaceholderOverlay",
    props: {
        width: {
            type: Number,
            default: 320,
        },
        height: {
            type: Number,
            default: 180,
        },
        text: {
            type: String,
            default: "Image Placeholder",
        },
        showOnlyOnHover: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style scoped>
.placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.show-on-hover {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .show-on-hover {
  opacity: 1;
}

.placeholder-svg {
  width: 100%;
  height: 100%;
}

.placeholder-line {
  stroke: var(--v-background-darken3);
  stroke-width: 2;
}

.placeholder-text {
  fill: var(--v-background-darken3);
  font-size: 24px;
  font-weight: 500;
}

/* Adjustments for different screen sizes */
@media (max-width: 600px) {
  .placeholder-text {
    font-size: 18px;
  }
}
</style>
