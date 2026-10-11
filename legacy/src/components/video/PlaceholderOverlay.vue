<template>
  <div
    class="placeholder-overlay"
    :class="{ 'show-on-hover': showOnlyOnHover }"
  >
    <div class="placeholder-content">
      <svg :viewBox="`0 0 400 225`" xmlns="http://www.w3.org/2000/svg" class="placeholder-svg">
        <g
          class="placeholder-line"
          stroke="var(--v-background-darken3)"
          stroke-dasharray="0,20"
          stroke-linecap="round"
          stroke-width="12"
        >
          <line
            :y1="225 * 2 / 10"
            :y2="225 * 8.4 / 10"
            x1="0"
            x2="0"
          />
          <line
            :y1="225 * 2 / 10"
            :y2="225 * 8.4 / 10"
            x1="400"
            x2="400"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
    name: "PlaceholderOverlay",
    props: {
        showOnlyOnHover: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
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

.placeholder-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.show-on-hover {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .show-on-hover {
  opacity: 1;
}

.placeholder-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.placeholder-line {
  opacity: 0.9;
}

/* Hover animations */
.video-card:hover .placeholder-line {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}
</style>
