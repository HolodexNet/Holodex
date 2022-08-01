<template>
  <svg viewBox="-2 -2 28 30" :class="loading ? 'l_loading' : ''">
    <g>
      <path
        id="tri1"
        d="M4.5 2a2 2 0 0 1 3-1.7L23 9.6a2 2 0 0 1 0 3.5L7.6 22.4a2 2 0 0 1-3-1.7V2Z"
        fill="url(#a-iid-3)"
      ></path>
      <path
        id="tri2"
        d="M0 2A2 2 0 0 1 3 .3l15.5 9.3a2 2 0 0 1 0 3.5L3.1 22.4A2 2 0 0 1 0 20.7V2Z"
        fill="url(#b-iid-3)"
      ></path>
    </g>
    <defs>
      <linearGradient
        id="a-iid-3"
        x1=".2"
        y1="2.8"
        x2="19.3"
        y2="18.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#F06292"></stop>
        <stop offset="1" stop-color="#FF3A81"></stop>
      </linearGradient>
      <linearGradient
        id="b-iid-3"
        x1="-4.4"
        y1="2.8"
        x2="19.5"
        y2="11.3"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#5DA2F2"></stop>
        <stop offset="1" stop-color="#715BF7" stop-opacity=".8"></stop>
      </linearGradient>
    </defs>
  </svg>
</template>

<script lang="ts">
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Logo",
  props: {
    loading: Boolean,
  },
  data() {
    return { idx: Math.floor(Math.random() * 200) };
  },
};
</script>

<style>
.l_loading #tri1 {
  animation: bounce 0.5s ease-in-out infinite alternate,
    stroke-move 8s linear infinite;

  stroke: rgb(226, 235, 255);
  stroke-dasharray: 12;
}

.l_loading #tri2 {
  animation: bounce 0.5s ease-in-out infinite alternate,
    stroke-move 8s linear infinite;
  animation-delay: 250ms;

  stroke: rgb(226, 235, 255);
  stroke-dasharray: 16;
}

@keyframes bounce {
  from {
    transform: translateY(0%);
  }

  to {
    transform: translateY(10%);
  }
}
@keyframes stroke-move {
  to {
    stroke-dashoffset: 190;
  }
}
</style>
