<template>
  <div class="overlay d-flex justify-center">
    <span class="overlay-text">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="text-center mb-1"
      >
        <div
          v-if="!msg.is_tl"
          class="subtitle-name"
          :class="msg.is_owner ? 'primary--text' : 'secondary--text'"
        >
          {{ msg.name }} :
        </div>
        <span class="subtitle-text" v-html="msg.message" />
      </div>
    </span>
  </div>
</template>

<script>
export default {
    name: "WatchVideoOverlay",
    props: {
        messages: {
            type: Array,
            required: true,
        },
    },
};
</script>

<style scoped>
.overlay {
  position: absolute;
  bottom: 42px;
  width: 90%;
  margin-left: 5%;
}

.subtitle-text {
    font-size: 16px;
    font-size: max(1.5vw, 16px);
    word-wrap: break-word;
    box-shadow: 10px 0 0 rgba(0,0,0,0.75), -10px 0 0 rgba(0,0,0,0.75);
    background: rgba(0,0,0,0.75);
}
.subtitle-name {
  font-size: 16px;
  font-size: max(1vw, 16px);
  padding: 0 8px;
  background: rgba(0,0,0,0.75);
  margin-bottom: -.3rem;
}
</style>
