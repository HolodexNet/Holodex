<script lang="ts">
import { debounce } from "@/utils/functions";
import VMenu from "vuetify/lib/components/VMenu/VMenu";

export default {
    name: "ResponsiveMenu",
    extends: VMenu,
    props: {
        itemCount: {
            type: Number,
        },
    },
    computed: {
        // styles() {
        //     return {
        //         maxHeight: this.calculatedMaxHeight,
        //         minWidth: this.calculatedMinWidth,
        //         maxWidth: this.calculatedMaxWidth,
        //         bottom: `${document.body.clientHeight - this.dimension.activator.top}px`,
        //         left: this.calculatedLeft,
        //         // transformOrigin: this.origin,
        //         zIndex: this.zIndex || this.activeZIndex,
        //     }
        // },
    },
    watch: {
        // eslint-disable-next-line func-names
        itemCount: debounce(function () {
            // console.log("huh it changed");
            this.onResize();
        }, 500),
    },
};
</script>
