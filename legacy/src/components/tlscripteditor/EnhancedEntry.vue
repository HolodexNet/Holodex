<template>
  <span class="EntryContainer2" :style="textStyle">
    {{ stext }}
  </span>
</template>

<script lang="ts">
export default {
    name: "EnhancedEntry",
    props: {
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
.EntryContainer2 {
    font-weight: bold;
    text-align: center;
    margin: 2px 4px 2px 4px;
    word-wrap: break-word;
}
</style>
