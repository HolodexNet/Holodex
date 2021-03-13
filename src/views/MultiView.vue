<template>
    <div style="width: 100%; margin-top: 10px">
        <grid-layout
            :layout.sync="layout"
            :col-num="12"
            :row-height="30"
            :col-width="30"
            :is-draggable="editMode"
            :is-resizable="editMode"
            :responsive="false"
            :vertical-compact="false"
            :prevent-collision="true"
        >
            <grid-item
                v-for="item in layout"
                :static="item.static"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                :key="item.i"
            >
                <v-card style="height: 100%">
                    <span class="text">{{ item.i }}</span>
                </v-card>
            </grid-item>
        </grid-layout>
    </div>
</template>

<script>
import VueGridLayout from "vue-grid-layout";
import api from "@/utils/backend-api";

export default {
    name: "MultiView",
    components: {
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
    },
    data() {
        return {
            layout: [
                { x: 0, y: 0, w: 2, h: 2, i: "0" },
                { x: 2, y: 0, w: 2, h: 4, i: "1" },
                { x: 4, y: 0, w: 2, h: 5, i: "2" },
                { x: 6, y: 0, w: 2, h: 3, i: "3" },
            ],
            editMode: true,
            index: 0,
            favoritesLive: [],
        };
    },
    mounted() {
        api.favoritesLive({
            channels: this.$store.state.favorites.favorites.map((f) => f.id).join(","),
        }).then((data) => {
            console.log(data);
            this.favoritesLive = data;
        });
    },
};
</script>

<style></style>
