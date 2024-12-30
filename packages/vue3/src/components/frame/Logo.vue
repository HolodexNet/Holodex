<template>
  <svg viewBox="-2 -2 28 30" :class="loading ? 'l_loading' : ''">
    <g>
      <path
        id="tri1"
        d="M4.5 2a2 2 0 0 1 3-1.7L23 9.6a2 2 0 0 1 0 3.5L7.6 22.4a2 2 0 0 1-3-1.7V2Z"
        fill="url(#a-iid-3)"
      />
      <path
        id="tri2"
        d="M0 2A2 2 0 0 1 3 .3l15.5 9.3a2 2 0 0 1 0 3.5L3.1 22.4A2 2 0 0 1 0 20.7V2Z"
        fill="url(#b-iid-3)"
      />
    </g>
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
  @apply brightness-150;
  animation:
    bounce 0.5s ease-in-out infinite alternate,
    stroke-move 8s linear infinite;
}

.l_loading #tri2 {
  @apply brightness-150;
  animation:
    bounce 0.5s ease-in-out infinite alternate,
    stroke-move 8s linear infinite;
  animation-delay: 250ms;
}

@keyframes bounce {
  from {
    transform: translateY(0%);
  }

  to {
    transform: translateY(10%);
  }
}
</style>
