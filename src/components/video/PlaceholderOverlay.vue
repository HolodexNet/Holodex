<template>
  <div
    class="placeholder-overlay"
    :class="{ 'show-on-hover': showOnlyOnHover }"
  >
    <div class="placeholder-content">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" class="placeholder-svg">
        <defs>
          <mask id="textMask">
            <rect width="400" height="400" fill="white" />
            <rect
              x="100"
              y="150"
              width="200"
              height="100"
              rx="10"
              ry="10"
              fill="black"
            />
          </mask>
        </defs>

        <!-- X shape with cutout -->
        <g mask="url(#textMask)">
          <!-- First diagonal line of X -->
          <line
            x1="10"
            y1="10"
            x2="390"
            y2="390"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            opacity="50%"
            class="placeholder-line"
          />

          <!-- Second diagonal line of X -->
          <line
            x1="390"
            y1="10"
            x2="10"
            y2="390"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            opacity="50%"
            class="placeholder-line"
          />
        </g>

        <!-- Border of the cutout area (optional, for visibility) -->
        <rect
          x="100"
          y="150"
          width="200"
          height="100"
          rx="10"
          ry="10"
          stroke="none"
          stroke-width="2"
          fill="none"
        />

        <!-- Text indicating where custom text can go -->
        <!-- <text x="200" y="200" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24">{{text}}</text> -->
      </svg>
      <div class="text-container">
        <!-- <div class="placeholder-text">
          {{ text }}
        </div> -->

        <!-- Optional badge for stream type -->
        <div class="stream-badge">
          <v-icon small class="mr-1">
            {{ placeholderIconMap[text] }}
          </v-icon>
          {{ streamType }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mdiBroadcast } from "@mdi/js";

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
        streamType: {
            type: String,
            default: "Scheduled Stream",
        },
    },
    data() {
        return {
            placeholderIconMap: {
                Event: this.icons.mdiCalendar,
                "Scheduled Stream": this.icons.mdiYoutube,
                "External Stream": mdiBroadcast,
            },
        };
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
  stroke: var(--v-background-darken3);
  stroke-width: 2.5;
  stroke-linecap: round;
  opacity: 0.9;
}

.text-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 3;
}

.placeholder-text {
  color: var(--v-background-darken3);
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.4), 0px 0px 4px rgba(0, 0, 0, 0.2);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px 12px;
  border-radius: 4px;
  max-width: 80%;
  word-break: break-word;
  backdrop-filter: blur(2px);
}

.stream-badge {
  display: inline-flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 500;
  opacity: 60%;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 6px;
  backdrop-filter: blur(2px);
}

.video-card:hover .stream-badge {
    opacity: 20%;
}

.video-card:hover .placeholder-svg {
    opacity: 40%;
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
