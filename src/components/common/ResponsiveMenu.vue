<script lang="ts">
import debounce from "lodash-es/debounce";
import VMenu from "vuetify/lib/components/VMenu/VMenu";

export default {
    name: "ResponsiveMenu",
    extends: VMenu,
    props: {
        itemCount: {
            type: Number,
            default: 0,
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        itemCount: debounce(function () {
            this.onResize();
        }, 500),
    },
};
</script>
