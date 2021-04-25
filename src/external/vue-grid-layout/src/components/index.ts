import GridItem from "./GridItem.vue";
import GridLayout from "./GridLayout.vue";
import type Vue from "vue";
import { VueConstructor } from "vue/types/umd";
// import ResponsiveGridLayout from './ResponsiveGridLayout.vue';

const VueGridLayout = {
    // ResponsiveGridLayout,
    GridLayout,
    GridItem,
};

let installedMap: Map<Function, boolean> = new Map();
let GlobalVue: VueConstructor = null;
if (typeof window !== "undefined") {
    GlobalVue = window.Vue;
} else if (typeof globalThis !== "undefined") {
    GlobalVue = globalThis.Vue;
}
if (GlobalVue) {
    GlobalVue.use({
        install: (Vue) => {
            if (installedMap.get(Vue.component) === true) return;
            installedMap.set(Vue.component, true);
            Object.keys(VueGridLayout).forEach((name) => {
                Vue.component(name, VueGridLayout[name]);
            });
        },
    });
}

export default VueGridLayout;
export { GridLayout, GridItem };
