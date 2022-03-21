<template>
  <span class="EntryContainer">
    {{ timeStamp }} :
    <span :style="textStyle">
      {{ stext }}
    </span>
  </span>
</template>

<script lang="ts">
export default {
    name: "EnhancedEntry",
    props: {
        time: {
            type: Number,
            default: 0,
        },
        stext: {
            type: String,
            default: "",
        },
        cc: {
            type: String,
            default: "",
        },
        oc: {
            type: String,
            default: "",
        },
    },
    computed: {
        timeStamp() {
            return new Date(this.time).toTimeString().split(" ")[0];
        },
        textStyle() {
            return {
                "-webkit-text-fill-color": (this.cc === "") ? "unset" : this.cc,
                "-webkit-text-stroke-color": (this.oc === "") ? "unset" : this.oc,
                "-webkit-text-stroke-width": (this.oc === "") ? "0px" : "1px",
            };
        },
    },
};
</script>

<style>
.EntryContainer {
    font-weight: bold;
}
</style>
