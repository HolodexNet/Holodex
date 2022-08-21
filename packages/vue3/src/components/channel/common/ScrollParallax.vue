<template>
  <div ref="scrollParallax">
    <slot></slot>
  </div>
</template>

<script>
export default defineComponent({
  name: "ScrollParallax",
  props: {
    speed: {
      type: Number,
      required: true,
      default: 0.15,
    },
    down: {
      type: Boolean,
      default: false,
      required: false,
    },
    up: {
      type: Boolean,
      default: true,
      required: false,
    },
    right: {
      type: Boolean,
      default: true,
      required: false,
    },
    left: {
      type: Boolean,
      default: false,
      requiredequired: false,
    },
    direction: {
      type: String,
      default: "y",
      required: false,
    },
  },
  data() {
    return {
      el: null,
      axes: null,
      speedCoeff: null,
    };
  },
  mounted() {
    this.loadParallax();
  },
  methods: {
    loadParallax() {
      this.initDirection();
      this.el = this.$refs.scrollParallax;
      // const speedCoeff = this.down ? -this.speed : this.speed;
      window.addEventListener("scroll", () => {
        this.el.style.transform = `translate${this.axes}(${
          window.pageYOffset * this.speedCoeff
        }px)`;
      });
    },
    initDirection() {
      if (this.direction === "x") {
        this.axes = "X";
        if (this.left) {
          this.speedCoeff = -this.speed;
        } else {
          this.speedCoeff = this.speed;
        }
      } else if (this.direction === "y") {
        this.axes = "Y";
        if (this.down) {
          this.speedCoeff = -this.speed;
        } else {
          this.speedCoeff = this.speed;
        }
      }
    },
  },
});
</script>
