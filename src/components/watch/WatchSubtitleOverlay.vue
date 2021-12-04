<template>
  <div class="overlay d-flex justify-center">
    <span class="overlay-text">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="text-center"
      >
        <div
          v-if="!msg.is_tl"
          class="subtitle-name"
          :class="msg.is_owner ? 'primary--text' : 'secondary--text'"
        >
          <span>{{ msg.name }} :</span>
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
  bottom: 48px;
  bottom: min(48px, 10%);
  left: 50%;
  transform: translateX(-50%);
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
  margin-bottom: -.3rem;
}

.subtitle-name span {
  background: rgba(0,0,0,0.75);
  padding: 0 8px;
}
</style>
