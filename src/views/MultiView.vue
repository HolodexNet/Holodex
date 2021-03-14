<template>
    <div style="width: 100%">
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
            @layout-updated="layoutUpdatedEvent"
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
                <v-card
                    class="video d-flex justify-center align-center"
                    :style="{
                        backgroundImage: layoutVideos[item.i]
                            ? `url(${getVideoThumbnails(layoutVideos[item.i].id, false).medium})`
                            : '',
                        border: editMode ? '1px solid pink' : '',
                    }"
                >
                    <span class="text">{{ item.i }}</span>
                    <v-btn @click="showSelectorForId = item.i" v-if="editMode">
                        <v-icon>{{ icons.mdiPencil }}</v-icon>
                    </v-btn>
                </v-card>
            </grid-item>
        </grid-layout>
        <v-dialog v-model="showOverlay">
            <VideoSelector @videoClicked="handleVideoClicked" style="width: 100%" />
        </v-dialog>
    </div>
</template>

<script>
import VueGridLayout from "vue-grid-layout";
import VideoSelector from "@/components/multiview/VideoSelector";
import { getVideoThumbnails } from "@/utils/functions";
// import { mapState } from "vuex";

export default {
    name: "MultiView",
    components: {
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
        VideoSelector,
    },
    data() {
        return {
            // layout: [
            //     { x: 0, y: 0, w: 2, h: 2, i: "0" },
            //     { x: 2, y: 0, w: 2, h: 4, i: "1" },
            //     { x: 4, y: 0, w: 2, h: 5, i: "2" },
            //     { x: 6, y: 0, w: 2, h: 3, i: "3" },
            // ],
            editMode: true,
            index: 0,
            showSelectorForId: -1,
        };
    },
    mounted() {},
    computed: {
        layout: {
            get() {
                return this.$store.state.multiview.layout;
            },
        },
        layoutVideos: {
            get() {
                return this.$store.state.multiview.layoutVideos;
            },
        },
        showOverlay: {
            get() {
                return this.showSelectorForId !== -1;
            },
            set(open) {
                if (!open) this.showSelectorForId = -1;
            },
        },
    },
    methods: {
        getVideoThumbnails,
        handleVideoClicked(video) {
            console.log(video);
            console.log(this.showSelectorForId);
            this.$store.commit("multiview/setLayoutVideo", { id: this.showSelectorForId, video });
            this.showSelectorForId = -1;
        },
        layoutUpdatedEvent(newLayout) {
            this.$store.commit("multiview/setLayout", newLayout);
        },
        handleOutside(e) {
            console.log(e);
        },
    },
};
</script>

<style scoped lang="scss">
.video {
    background-size: contain;
    background-position: center;
    height: 100%;
}
</style>
