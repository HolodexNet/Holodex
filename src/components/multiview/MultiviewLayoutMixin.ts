import { decodeLayout, desktopPresets, mobilePresets } from "@/utils/mv-utils";
import { mapGetters } from "vuex";

export default {
    data() {
        return {};
    },
    computed: {
        ...mapGetters("multiview", [
            "decodedCustomPresets",
            "decodedDesktopPresets",
            "decodedMobilePresets",
            "desktopGroups",
        ]),
        decodedAutoLayout() {
            return this.autoLayout
                .filter((l) => l)
                .map((preset) => ({
                    // convert original encoded to id
                    id: preset.layout,
                    ...decodeLayout(preset),
                }));
        },
    },
    methods: {
        removeItemById(i) {
            this.$store.commit("multiview/removeLayoutItem", i);
        },
        clearAllItems() {
            this.$store.commit("multiview/resetState");
        },
        addItem() {
            this.$store.commit("multiview/addLayoutItem");
        },
        addVideoWithId(video, id) {
            // set video for a specific cell id
            this.$store.commit("multiview/setLayoutContentById", {
                id,
                content: {
                    id: video.id,
                    type: "video",
                    video,
                },
            });
        },
        findEmptyCell() {
            return this.layout.find((l) => !this.layoutContent[l.i]);
        },
        tryFillVideo(video) {
            // try find empty cell
            const emptyCell = this.findEmptyCell();
            if (emptyCell) {
                this.$store.commit("multiview/setLayoutContentById", {
                    id: emptyCell.i,
                    content: {
                        id: video.id,
                        type: "video",
                        video,
                    },
                });
            }
            // TODO: snack bar saying no valid empty cells
        },
        isPreset(currentLayout) {
            // filter out any presets that dont match the amount of cells
            const toCompare = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout;

            // there's no presets with equal cells
            if (toCompare.length === 0) return false;

            // go through each preset, and check for full matching layouts
            return toCompare
                .filter((preset) => preset.layout.length === currentLayout.length)
                .some((preset) => {
                    for (let i = 0; i < currentLayout.length; i += 1) {
                        const presetCell = preset.layout[i];
                        const layoutCell = currentLayout[i];
                        if (
                            !(
                                presetCell.x === layoutCell.x
                                && presetCell.y === layoutCell.y
                                && presetCell.w === layoutCell.w
                                && presetCell.h === layoutCell.h
                            )
                        ) {
                            // at least one cell doesn't match, invalid layout
                            return false;
                        }
                    }
                    // all cells match, layout is a preset
                    return true;
                });
        },
        addVideoAutoLayout(video, onConflict) {
            // find layout with space for one more new video
            const presets = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout;
            const newLayout = presets.find((preset) => preset.videoCellCount === this.activeVideos.length + 1)
                ?? presets.find((preset) => preset.videoCellCount >= this.activeVideos.length + 1);

            // found new layout
            if (newLayout) {
                // deep clone preset
                const clonedLayout = JSON.parse(JSON.stringify(newLayout));

                // if the current layout is a preset or empty, set next layout without prompting
                if (!this.layout.length || this.isPreset(this.layout)) {
                    this.setMultiview({
                        ...clonedLayout,
                        mergeContent: true,
                    });
                    this.tryFillVideo(video);
                    return;
                }
                onConflict(clonedLayout);
            }
        },
        deleteVideoAutoLayout(cellId) {
            // Find and set to previous preset layout
            const presets = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout;
            const newLayout = presets.find((preset) => preset.videoCellCount === this.activeVideos.length - 1)
                ?? presets.find((preset) => preset.videoCellCount >= this.activeVideos.length - 1);

            const clonedLayout = JSON.parse(JSON.stringify(newLayout));
            this.$store.commit("multiview/deleteLayoutContent", cellId);
            this.setMultiview({
                ...clonedLayout,
                mergeContent: true,
            });
        },
        setMultiview({ layout, content, mergeContent = false }) {
            if (mergeContent) {
                const contentsToMerge = {};
                let currentIndex = 0;
                const currentContent = Object.values(this.layoutContent).filter((o) => (o as any).type === "video");
                // filter out already set items
                layout
                    .filter((item) => !content[item.i])
                    .forEach((item) => {
                        // fill until there's no more current videos
                        if (currentIndex >= this.activeVideos.length) {
                            return;
                        }

                        // get next video to fill this item's cell
                        const key = item.i;
                        const c: any = currentContent[currentIndex];

                        contentsToMerge[key] = c;
                        currentIndex += 1;
                    });
                // merge by key, prefer incoming content
                const merged = {
                    ...contentsToMerge,
                    ...content,
                };
                this.$store.commit("multiview/setLayoutContent", merged);
            } else {
                this.$store.commit("multiview/setLayoutContent", content);
            }
            this.$store.commit("multiview/setLayout", layout);
        },
        findKeyByVideoId(id) {
            return Object.keys(this.layoutContent).find((k) => this.layoutContent[k].id === id);
        },
    },
};
