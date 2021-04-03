<template>
    <div class="card-carousel-wrapper">
        <div class="card-carousel--nav__left" @click="moveCarousel(-1)" :disabled="atHeadOfList">
            <v-btn icon
                ><v-icon>{{ icons.mdiChevronLeft }}</v-icon></v-btn
            >
        </div>
        <div class="card-carousel" v-bind:style="{ 'min-width': itemWidth * windowSize + 'px' }">
            <div class="card-carousel--overflow-container">
                <div
                    class="card-carousel-cards"
                    :style="{ transform: 'translateX' + '(' + currentOffset + 'px' + ')' }"
                >
                    <slot></slot>
                </div>
            </div>
        </div>
        <div class="card-carousel--nav__right" @click="moveCarousel(1)" :disabled="atEndOfList">
            <v-btn icon
                ><v-icon>{{ icons.mdiChevronRight }}</v-icon></v-btn
            >
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "Carousel",
    props: {
        windowSize: {
            type: Number,
            required: false,
            default: 4,
        },
        itemWidth: {
            type: Number,
            required: false,
            default: 220,
        },
        itemCount: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            currentOffset: 0,
        };
    },
    computed: {
        atEndOfList() {
            return this.currentOffset <= this.itemWidth * -1 * (this.itemCount - this.windowSize);
        },
        atHeadOfList() {
            return this.currentOffset === 0;
        },
    },
    methods: {
        moveCarousel(direction) {
            // Find a more elegant way to express the :style. consider using props to make it truly generic
            if (direction === 1 && !this.atEndOfList) {
                this.currentOffset -= this.itemWidth;
            } else if (direction === -1 && !this.atHeadOfList) {
                this.currentOffset += this.itemWidth;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.card-carousel-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-carousel {
    display: flex;
    justify-content: center;

    &--overflow-container {
        overflow: hidden;
    }

    &--nav__left,
    &--nav__right {
        display: inline-block;
        // width: 15px;
        // height: 15px;
        // padding: 10px;
        box-sizing: border-box;
        // border-top: 2px solid #555;
        // border-right: 2px solid #555;
        cursor: pointer;
        // margin: 0 20px;
        transition: transform 150ms linear;
        &[disabled] {
            opacity: 0.2;
            border-color: black;
        }
    }

    // &--nav__left {
    //   transform: rotate(-135deg);
    //   &:active {
    //     transform: rotate(-135deg) scale(0.9);
    //   }
    // }

    // &--nav__right {
    //   transform: rotate(45deg);
    //   &:active {
    //     transform: rotate(45deg) scale(0.9);
    //   }
    // }
}

.card-carousel-cards {
    display: flex;
    transition: transform 150ms ease-out;
    transform: translatex(0px);
}
</style>
