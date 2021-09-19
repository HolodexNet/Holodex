import { mapState, mapGetters } from "vuex";

export default {
    name: "Cell",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    computed: {
        ...mapGetters("multiview", ["activeVideos"]),
        ...mapState("multiview", ["layoutContent"]),
        editMode: {
            get() {
                if (!this.layoutContent[this.item.i]) return false;
                return this.layoutContent[this.item.i].editMode ?? true;
            },
            set(value) {
                this.$store.commit("multiview/setLayoutContentWithKey", { id: this.item.i, key: "editMode", value });
            },
        },
        cellContent() {
            return this.layoutContent[this.item.i];
        },
        isChat() {
            return this.cellContent?.type === "chat";
        },
        isVideo() {
            return this.cellContent?.type === "video";
        },
    },
    methods: {
        refresh() {
            this.uniqueId = Date.now();
            this.editMode = true;
        },
        setItemAsChat(item) {
            this.$store.commit("multiview/setLayoutContentById", {
                id: item.i,
                content: {
                    type: "chat",
                },
            });
        },
        deleteCell() {
            this.$emit("delete", this.item.i);
        },
        resetCell() {
            this.$store.commit("multiview/deleteLayoutContent", this.item.i);
        },
        iOS() {
            return (
                ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(
                    navigator.platform,
                )
                // iPad on iOS 13 detection
                || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
            );
        },
    },
};
