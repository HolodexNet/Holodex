import { Content, decodeLayout, sortLayout } from "@/utils/mv-utils";
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
            "nonChatCellCount",
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
            this.$store.dispatch("multiview/fetchVideoData");
        },
        findEmptyCell() {
            return this.layout.find((l) => !this.layoutContent[l.i]);
        },
        tryFillVideo(video) {
            if (!video) return;
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
                this.$store.dispatch("multiview/fetchVideoData");
            }
            // TODO: snack bar saying no valid empty cells
        },
        isPreset(currentLayout) {
            // filter out any presets that dont match the amount of cells
            const toCompare = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout.concat(this.decodedDesktopPresets);
            const comparable = toCompare.filter((preset) => preset.layout.length === currentLayout.length);
            // there's no presets with equal cells
            if (comparable.length === 0) return false;
            const clone = [...currentLayout];
            clone.sort(sortLayout);
            // go through each preset, and check for full matching layouts
            return comparable.some((preset) => {
                    for (let i = 0; i < currentLayout.length; i += 1) {
                        const presetCell = preset.layout[i];
                        const layoutCell = clone[i];
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
                        // Tell chat merging that a new video will be added
                        hintAdd: true,
                    });
                    this.tryFillVideo(video);
                    return;
                }
                onConflict(clonedLayout);
            }
        },
        addCellAutoLayout() {
            // find layout with space for one more new video
            const presets = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout;
            const newLayout = presets.find((preset) => preset.videoCellCount === this.nonChatCellCount + 1)
                ?? presets.find((preset) => preset.videoCellCount >= this.nonChatCellCount + 1);

            // found new layout
            if (newLayout) {
                // deep clone preset
                const clonedLayout = JSON.parse(JSON.stringify(newLayout));

                // if the current layout is a preset or empty, set next layout without prompting
                if (!this.layout.length || this.isPreset(this.layout)) {
                    this.setMultiview({
                        ...clonedLayout,
                        mergeContent: true,
                        // Tell chat merging that a new video will be added
                        hintAdd: false,
                    });
                    return;
                }
            }

            this.addItem();
        },
        deleteVideoAutoLayout(id) {
            if (this.isPreset(this.layout) && (this.layoutContent[id]?.type !== "chat")) {
                // Clear everything if it's 1 video
                if (this.nonChatCellCount === 1) {
                    this.clearAllItems();
                    return;
                }

                // Find and set to previous preset layout
                const presets = this.isMobile ? this.decodedMobilePresets : this.decodedAutoLayout;
                const newLayout = presets.find((preset) => preset.videoCellCount === this.nonChatCellCount - 1)
                    ?? presets.find((preset) => preset.videoCellCount === this.nonChatCellCount - 1);

                if (!newLayout) {
                    // Can't downgrade layout, because step doesn't exist
                    this.$store.commit("multiview/removeLayoutItem", id);
                    return;
                }

                const clonedLayout = JSON.parse(JSON.stringify(newLayout));
                this.$store.commit("multiview/deleteLayoutContent", id);
                this.setMultiview({
                    ...clonedLayout,
                    mergeContent: true,
                });
            } else {
                // Default: delete item
                this.$store.commit("multiview/removeLayoutItem", id);
            }
        },
        setMultiview({ layout, content, mergeContent = false, hintAdd = false }) {
            /**
            * Below contains the logic to merge an existing multiview layout to a new layout
            * For videos it is a straight forward migrate to next layout as space permits
            * For chat, it remaps the currentTab to point to the same video in the next layout
            * additionally, new chats should point to a unique tab that isn't active.
            */
            if (mergeContent) {
                const contentsToMerge = {};
                let videoIndex = 0;
                const currentVideos = Object.values(this.layoutContent as Content[]).filter((o) => o.type === "video");
                const newVideoIdToIndex = {};
                // Loop through the incoming layout, and fill with current content
                layout.filter((item) => !content[item.i]).forEach((item) => {
                    // For empty cells fill until there's no more current videos
                    if (videoIndex < this.activeVideos.length) {
                        // get next video to fill this item's cell
                        const key = item.i;
                        contentsToMerge[key] = currentVideos[videoIndex];
                        // Infer next activeVideos to be used in auto chat tabbing below
                        newVideoIdToIndex[currentVideos[videoIndex].video.id] = videoIndex;
                        videoIndex += 1;
                    }
                });

                // Check what curent chats point to, to be remapped
                const activeChatsAsVideoId = Object.values(this.layoutContent as Content[])
                    .filter((o) => o.type === "chat")
                    .map((o) => this.activeVideos[o.currentTab]?.id);
                let chatIndex = 0;

                // Create an array of possible currentTabs from 1 ... n
                // Where n is videoIndex + the video about to be added
                const maxVideoLength = hintAdd ? videoIndex + 1 : videoIndex;
                const uniqueIndexes = new Set([...Array(maxVideoLength).keys()]);

                layout.filter((item) => content[item.i] && content[item.i].type === "chat").forEach((item) => {
                    // All current cells have been accounted for, start setting currentTabs based on what's still available
                    if (chatIndex >= activeChatsAsVideoId.length) {
                        // Find next index not already used
                        const uniqueIndex = uniqueIndexes.values().next().value;
                        content[item.i] = {
                            ...content[item.i],
                            currentTab: uniqueIndex,
                        };
                        // Remove from pool
                        uniqueIndexes.delete(uniqueIndex);
                        return;
                    }

                    // Remap the currentTab index to point to same video
                    const videoId = activeChatsAsVideoId[chatIndex];
                    content[item.i] = {
                        ...content[item.i],
                        currentTab: newVideoIdToIndex[videoId],
                    };
                    // Remove from the pool of uniqueindex if not already deleted
                    uniqueIndexes.delete(newVideoIdToIndex[videoId]);
                    chatIndex += 1;
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
            this.$store.dispatch("multiview/fetchVideoData");
        },
        findKeyByVideoId(id) {
            return Object.keys(this.layoutContent).find((k) => this.layoutContent[k].id === id);
        },
    },
};
