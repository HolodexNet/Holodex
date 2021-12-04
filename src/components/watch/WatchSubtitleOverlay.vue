<template>
  <div class="overlay d-flex justify-center">
    <span class="overlay-text">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="text-center mb-1"
      >
        <span style="background: rgba(0,0,0,0.75);" class="px-2"> {{ msg.message }} </span>
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
  font-size: 16px;
  font-size: max(1.5vw, 16px);
  width: 90%;
  margin-left: 5%;
}
</style>
