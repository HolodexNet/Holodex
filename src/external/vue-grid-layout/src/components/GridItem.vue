<template>
    <div ref="item" class="vue-grid-item" :class="classObj" :style="style">
        <slot></slot>
        <span
            v-for="(dir, idx) in resizeDirections"
            ref="handle"
            :class="[
                draggable && 'vue-resizable-handle',
                `dir-${dir}`,
                dir[0] && `h-${dir[0]}`,
                dir[1] && `h-${dir[1]}`,
            ]"
            :key="'handle' + dir + idx"
            :style="{ cursor: `${dir}-resize` }"
        ></span>
        <!--<span v-if="draggable" ref="dragHandle" class="vue-draggable-handle"></span>-->
    </div>
</template>
<style lang="scss">
.vue-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
}

.vue-grid-item.no-touch {
    -ms-touch-action: none;
    touch-action: none;
}

.vue-grid-item.cssTransforms {
    transition-property: transform;
    left: 0;
    right: auto;
}

.vue-grid-item.resizing {
    opacity: 0.6;
    z-index: 3;
}

.vue-grid-item.vue-draggable-dragging {
    transition: none;
    z-index: 3;
}

.vue-grid-item.vue-grid-placeholder {
    background: red;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
}

.vue-grid-item > .vue-resizable-handle {
    position: absolute;
    min-width: 20px;
    min-height: 20px;
    box-sizing: border-box;

    padding: 4px;
    background-color: var(--v-primary-base, rgba(150, 93, 137, 0.452));
    opacity: 0.3;
    background-clip: content-box !important;

    &.h-n {
        top: 0 !important;
        left: 35%;
        bottom: unset;
        width: 30%;
        height: 20px !important;
    }
    &.h-w {
        left: 0 !important;
        top: 35%;
        left: unset;
        height: 30%;
        width: 20px !important;
    }
    &.h-s {
        bottom: 0 !important;
        left: 35%;
        top: unset !important;
        width: 30%;
        height: 20px !important;
    }
    &.h-e {
        right: 0 !important;
        top: 35%;
        bottom: unset;
        left: unset !important;
        height: 30%;
        width: 20px !important;
    }
}

.vue-grid-item.disable-userselect {
    user-select: none !important;
    cursor: none !important;
}
</style>
<script lang="ts">
import { setTopLeft, setTransform } from "../helpers/utils";
import { getControlPosition, createCoreData } from "../helpers/draggableUtils";
import { getColsFromBreakpoint } from "../helpers/responsiveUtils";

import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import "@interactjs/dev-tools";
import interact from "@interactjs/interact";

export default {
    name: "GridItem",
    props: {
        /*cols: {
             type: Number,
             required: true
             },*/
        /*containerWidth: {
             type: Number,
             required: true

             },
             rowHeight: {
             type: Number,
             required: true
             },
             margin: {
             type: Array,
             required: true
             },
             maxRows: {
             type: Number,
             required: true
             },*/
        isDraggable: {
            type: Boolean,
            required: false,
            default: null,
        },
        isResizable: {
            type: Boolean,
            required: false,
            default: null,
        },
        /*useCssTransforms: {
             type: Boolean,
             required: true
             },
             */
        static: {
            type: Boolean,
            required: false,
            default: false,
        },
        minH: {
            type: Number,
            required: false,
            default: 1,
        },
        minW: {
            type: Number,
            required: false,
            default: 1,
        },
        maxH: {
            type: Number,
            required: false,
            default: Infinity,
        },
        maxW: {
            type: Number,
            required: false,
            default: Infinity,
        },
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        w: {
            type: Number,
            required: true,
        },
        h: {
            type: Number,
            required: true,
        },
        i: {
            required: true,
        },
        dragIgnoreFrom: {
            type: String,
            required: false,
            default: "a, button",
        },
        dragAllowFrom: {
            type: String,
            required: false,
            default: null,
        },
        resizeIgnoreFrom: {
            type: String,
            required: false,
            default: "a, button",
        },
        resizeDirections: {
            type: Array,
            required: false,
            default: () => ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
        },
        preserveAspectRatio: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    inject: ["eventBus", "layout"],
    data: function () {
        return {
            cols: 1,
            containerWidth: 100,
            rowHeight: 30,
            margin: [10, 10],
            maxRows: Infinity,
            draggable: null,
            resizable: null,
            useCssTransforms: true,
            useStyleCursor: true,

            isDragging: false,
            dragging: null,
            isResizing: false,
            resizing: null,
            lastX: NaN,
            lastY: NaN,
            lastW: NaN,
            lastH: NaN,
            style: {},

            dragEventSet: false,
            resizeEventSet: false,

            previousW: null,
            previousH: null,
            previousX: null,
            previousY: null,
            innerX: this.x,
            innerY: this.y,
            innerW: this.w,
            innerH: this.h,
        };
    },
    created() {
        let self = this;

        // Accessible refernces of functions for removing in beforeDestroy
        self.updateWidthHandler = function (width) {
            self.updateWidth(width);
        };

        self.compactHandler = function (layout) {
            self.compact(layout);
        };

        self.setDraggableHandler = function (isDraggable) {
            if (self.isDraggable === null) {
                self.draggable = isDraggable;
            }
        };

        self.setResizableHandler = function (isResizable) {
            if (self.isResizable === null) {
                self.resizable = isResizable;
            }
        };

        self.setRowHeightHandler = function (rowHeight) {
            self.rowHeight = rowHeight;
        };

        self.setMaxRowsHandler = function (maxRows) {
            self.maxRows = maxRows;
        };

        self.setColNum = (colNum) => {
            self.cols = parseInt(colNum);
        };

        this.eventBus.$on("updateWidth", self.updateWidthHandler);
        this.eventBus.$on("compact", self.compactHandler);
        this.eventBus.$on("setDraggable", self.setDraggableHandler);
        this.eventBus.$on("setResizable", self.setResizableHandler);
        this.eventBus.$on("setRowHeight", self.setRowHeightHandler);
        this.eventBus.$on("setMaxRows", self.setMaxRowsHandler);
        this.eventBus.$on("setColNum", self.setColNum);
    },
    beforeDestroy: function () {
        let self = this;
        //Remove listeners
        this.eventBus.$off("updateWidth", self.updateWidthHandler);
        this.eventBus.$off("compact", self.compactHandler);
        this.eventBus.$off("setDraggable", self.setDraggableHandler);
        this.eventBus.$off("setResizable", self.setResizableHandler);
        this.eventBus.$off("setRowHeight", self.setRowHeightHandler);
        this.eventBus.$off("setMaxRows", self.setMaxRowsHandler);
        this.eventBus.$off("setColNum", self.setColNum);
        if (this.interactObj) {
            this.interactObj.unset(); // destroy interact intance
        }
    },
    mounted: function () {
        if (this.layout.responsive && this.layout.lastBreakpoint) {
            this.cols = getColsFromBreakpoint(this.layout.lastBreakpoint, this.layout.cols);
        } else {
            this.cols = this.layout.colNum;
        }
        this.rowHeight = this.layout.rowHeight;
        this.containerWidth = this.layout.width !== null ? this.layout.width : 100;
        this.margin = this.layout.margin !== undefined ? this.layout.margin : [10, 10];
        this.maxRows = this.layout.maxRows;

        if (this.isDraggable === null) {
            this.draggable = this.layout.isDraggable;
        } else {
            this.draggable = this.isDraggable;
        }
        if (this.isResizable === null) {
            this.resizable = this.layout.isResizable;
        } else {
            this.resizable = this.isResizable;
        }
        this.useCssTransforms = this.layout.useCssTransforms;
        this.useStyleCursor = this.layout.useStyleCursor;
        this.createStyle();
    },
    watch: {
        isDraggable: function () {
            this.draggable = this.isDraggable;
        },
        static: function () {
            this.tryMakeDraggable();
            this.tryMakeResizable();
        },
        draggable: function () {
            this.tryMakeDraggable();
        },
        isResizable: function () {
            this.resizable = this.isResizable;
        },
        resizable: function () {
            this.tryMakeResizable();
        },
        rowHeight: function () {
            this.createStyle();
            this.emitContainerResized();
        },
        cols: function () {
            this.tryMakeResizable();
            this.createStyle();
            this.emitContainerResized();
        },
        containerWidth: function () {
            this.tryMakeResizable();
            this.createStyle();
            this.emitContainerResized();
        },
        x: function (newVal) {
            this.innerX = newVal;
            this.createStyle();
        },
        y: function (newVal) {
            this.innerY = newVal;
            this.createStyle();
        },
        h: function (newVal) {
            this.innerH = newVal;
            this.createStyle();
            // this.emitContainerResized();
        },
        w: function (newVal) {
            this.innerW = newVal;
            this.createStyle();
            // this.emitContainerResized();
        },
        minH: function () {
            this.tryMakeResizable();
        },
        maxH: function () {
            this.tryMakeResizable();
        },
        minW: function () {
            this.tryMakeResizable();
        },
        maxW: function () {
            this.tryMakeResizable();
        },
        "$parent.margin": function (margin) {
            if (!margin || (margin[0] == this.margin[0] && margin[1] == this.margin[1])) {
                return;
            }
            this.margin = margin.map((m) => Number(m));
            this.createStyle();
            this.emitContainerResized();
        },
    },
    computed: {
        classObj() {
            return {
                "vue-resizable": this.resizableAndNotStatic,
                static: this.static,
                resizing: this.isResizing,
                "vue-draggable-dragging": this.isDragging,
                cssTransforms: this.useCssTransforms,
                "disable-userselect": this.isDragging,
                "no-touch": this.isAndroid && this.draggableOrResizableAndNotStatic,
            };
        },
        resizableAndNotStatic() {
            return this.resizable && !this.static;
        },
        draggableOrResizableAndNotStatic() {
            return (this.draggable || this.resizable) && !this.static;
        },
        isAndroid() {
            return navigator.userAgent.toLowerCase().indexOf("android") !== -1;
        },
        resizableHandleClass() {
            return "vue-resizable-handle";
        },
    },
    methods: {
        createStyle: function () {
            if (this.x + this.w > this.cols) {
                this.innerX = 0;
                this.innerW = this.w > this.cols ? this.cols : this.w;
            } else {
                this.innerX = this.x;
                this.innerW = this.w;
            }
            let pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);

            if (this.isDragging) {
                pos.top = this.dragging.top;
                pos.left = this.dragging.left;
            }
            if (this.isResizing) {
                pos.top = this.resizing.top;
                pos.left = this.resizing.left;
                pos.width = this.resizing.width;
                pos.height = this.resizing.height;
            }

            let style;
            // CSS Transforms support (default)
            if (this.useCssTransforms) {
                style = setTransform(pos.top, pos.left, pos.width, pos.height);
            } else {
                style = setTopLeft(pos.top, pos.left, pos.width, pos.height);
            }
            this.style = style;
        },
        emitContainerResized() {
            // this.style has width and height with trailing 'px'. The
            // resized event is without them
            let styleProps = { width: "", height: "" };
            for (let prop of ["width", "height"]) {
                let val = this.style[prop];
                let matches = val.match(/^(\d+)px$/);
                if (!matches) return;
                styleProps[prop as keyof typeof styleProps] = matches[1];
            }
            this.$emit("container-resized", this.i, this.h, this.w, styleProps.height, styleProps.width);
        },
        handleResize: function (event) {
            if (this.static) return;
            const position = getControlPosition(event);
            // Get the current drag point from the event. This is used as the offset.
            if (position == null) return; // not possible but satisfies flow
            const { x, y } = position;
            // console.log(position);
            // console.log(event);
            let newSize: { left?: number; top?: number; width: number; height: number } = { width: 0, height: 0 };
            let pos;

            // const newRect = {};
            // let pos;
            switch (event.type) {
                case "resizestart": {
                    this.previousW = this.innerW;
                    this.previousH = this.innerH;
                    // pos = ;
                    // top left width height
                    this.resizing = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
                    newSize = { ...this.resizing };
                    this.isResizing = true;
                    break;
                }
                case "resizemove": {
                    //                        console.log("### resize => " + event.type + ", lastW=" + this.lastW + ", lastH=" + this.lastH);
                    const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
                    newSize = { ...this.resizing };
                    if (event.edges.bottom) newSize.height = this.resizing.height + coreEvent.deltaY;
                    if (event.edges.right) newSize.width = this.resizing.width + coreEvent.deltaX;
                    if (event.edges.left) {
                        newSize.left = this.resizing.left + coreEvent.deltaX;
                        newSize.width = this.resizing.width - coreEvent.deltaX;
                    }
                    if (event.edges.top) {
                        newSize.top = this.resizing.top + coreEvent.deltaY;
                        newSize.height = this.resizing.height - coreEvent.deltaY;
                    }

                    ///console.log("### resize => " + event.type + ", deltaX=" + coreEvent.deltaX + ", deltaY=" + coreEvent.deltaY);
                    this.resizing = newSize;
                    break;
                }
                case "resizeend": {
                    //console.log("### resize end => x=" +this.innerX + " y=" + this.innerY + " w=" + this.innerW + " h=" + this.innerH);
                    pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
                    const coreEvent = createCoreData(this.lastW, this.lastH, x, y);
                    newSize = { ...this.resizing };
                    if (event.edges.bottom) newSize.height = this.resizing.height + coreEvent.deltaY;
                    if (event.edges.right) newSize.width = this.resizing.width + coreEvent.deltaX;
                    if (event.edges.left) {
                        newSize.left = this.resizing.left + coreEvent.deltaX;
                        newSize.width = this.resizing.width - coreEvent.deltaX;
                    }
                    if (event.edges.top) {
                        newSize.top = this.resizing.top + coreEvent.deltaY;
                        newSize.height = this.resizing.height - coreEvent.deltaY;
                    }
                    //                        console.log("### resize end => " + JSON.stringify(newSize));
                    this.resizing = null;
                    this.isResizing = false;
                    break;
                }
            }

            // Get new WH
            pos = this.calcWH(newSize.height, newSize.width);
            if (pos.w < this.minW) {
                pos.w = this.minW;
            }
            if (pos.w > this.maxW) {
                pos.w = this.maxW;
            }
            if (pos.h < this.minH) {
                pos.h = this.minH;
            }
            if (pos.h > this.maxH) {
                pos.h = this.maxH;
            }

            if (pos.h < 1) {
                pos.h = 1;
            }
            if (pos.w < 1) {
                pos.w = 1;
            }

            this.lastW = x;
            this.lastH = y;
            const newXY = this.calcXY(newSize.top, newSize.left);
            // console.log(newSize);

            if (this.innerW !== pos.w || this.innerH !== pos.h) {
                // this.$emit("resize", this.i, pos.h, pos.w, newSize.height, newSize.width);
            }
            if (event.type === "resizeend" && (this.previousW !== this.innerW || this.previousH !== this.innerH)) {
                // this.$emit("resized", this.i, pos.h, pos.w, newSize.height, newSize.width);
            }
            // this.eventBus.$emit("resizeEvent", event.type, this.i, this.innerX, this.innerY, pos.h, pos.w);
            // console.log(newSize.left, newSize.top);
            // console.log(newXY.x, newXY.y, pos.h, pos.w)
            this.eventBus.$emit("resizeEvent", event.type, this.i, newXY.x, newXY.y, pos.h, pos.w, event.edges);
        },
        handleDrag(event) {
            if (this.static) return;
            if (this.isResizing) return;

            const position = getControlPosition(event);

            // Get the current drag point from the event. This is used as the offset.
            if (position === null) return; // not possible but satisfies flow
            const { x, y } = position;

            // let shouldUpdate = false;
            let newPosition = { top: 0, left: 0 };
            switch (event.type) {
                case "dragstart": {
                    this.previousX = this.innerX;
                    this.previousY = this.innerY;

                    let parentRect = event.target.offsetParent.getBoundingClientRect();
                    let clientRect = event.target.getBoundingClientRect();

                    newPosition.left = clientRect.left - parentRect.left;
                    newPosition.top = clientRect.top - parentRect.top;

                    this.dragging = newPosition;
                    this.isDragging = true;
                    break;
                }
                case "dragend": {
                    if (!this.isDragging) return;
                    let parentRect = event.target.offsetParent.getBoundingClientRect();
                    let clientRect = event.target.getBoundingClientRect();
                    newPosition.left = clientRect.left - parentRect.left;
                    newPosition.top = clientRect.top - parentRect.top;
                    //                        console.log("### drag end => " + JSON.stringify(newPosition));
                    //                        console.log("### DROP: " + JSON.stringify(newPosition));
                    this.dragging = null;
                    this.isDragging = false;
                    // shouldUpdate = true;
                    break;
                }
                case "dragmove": {
                    const coreEvent = createCoreData(this.lastX, this.lastY, x, y);
                    newPosition.left = this.dragging.left + coreEvent.deltaX;
                    newPosition.top = this.dragging.top + coreEvent.deltaY;
                    //                        console.log("### drag => " + event.type + ", x=" + x + ", y=" + y);
                    //                        console.log("### drag => " + event.type + ", deltaX=" + coreEvent.deltaX + ", deltaY=" + coreEvent.deltaY);
                    //                        console.log("### drag end => " + JSON.stringify(newPosition));
                    this.dragging = newPosition;
                    break;
                }
            }

            // Get new XY
            let pos = this.calcXY(newPosition.top, newPosition.left);

            this.lastX = x;
            this.lastY = y;

            if (this.innerX !== pos.x || this.innerY !== pos.y) {
                this.$emit("move", this.i, pos.x, pos.y);
            }
            if (event.type === "dragend" && (this.previousX !== this.innerX || this.previousY !== this.innerY)) {
                this.$emit("moved", this.i, pos.x, pos.y);
            }
            this.eventBus.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.innerH, this.innerW);
        },
        /**
         * x, y, w, h =>
         * left, top, width, height
         */
        calcPosition: function (x, y, w, h) {
            const colWidth = this.calcColWidth();
            let out = {
                left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
                top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
                // 0 * Infinity === NaN, which causes problems with resize constriants;
                // Fix this if it occurs.
                // Note we do it here rather than later because Math.round(Infinity) causes deopt
                width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
                height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1]),
            };

            return out;
        },
        /**
         * Translate x and y coordinates from pixels to grid units.
         * @param  {Number} top  Top position (relative to parent) in pixels.
         * @param  {Number} left Left position (relative to parent) in pixels.
         * @return {Object} x and y in grid units.
         */
        calcXY(top, left) {
            const colWidth = this.calcColWidth();

            // left = colWidth * x + margin * (x + 1)
            // l = cx + m(x+1)
            // l = cx + mx + m
            // l - m = cx + mx
            // l - m = x(c + m)
            // (l - m) / (c + m) = x
            // x = (left - margin) / (coldWidth + margin)
            let x = Math.round((left - this.margin[0]) / (colWidth + this.margin[0]));
            let y = Math.round((top - this.margin[1]) / (this.rowHeight + this.margin[1]));

            // Capping
            x = Math.max(Math.min(x, this.cols - this.innerW), 0);
            y = Math.max(Math.min(y, this.maxRows - this.innerH), 0);

            return { x, y };
        },
        // Helper for generating column width
        calcColWidth() {
            const colWidth = (this.containerWidth - this.margin[0] * (this.cols + 1)) / this.cols;
            // console.log("### COLS=" + this.cols + " COL WIDTH=" + colWidth + " MARGIN " + this.margin[0]);
            return colWidth;
        },

        /**
         * Given a height and width in pixel values, calculate grid units.
         * @param  {Number} height Height in pixels.
         * @param  {Number} width  Width in pixels.
         * @param  {Boolean} autoSizeFlag  function autoSize identifier.
         * @return {Object} w, h as grid units.
         */
        calcWH(height, width, autoSizeFlag = false) {
            const colWidth = this.calcColWidth();

            // width = colWidth * w - (margin * (w - 1))
            // ...
            // w = (width + margin) / (colWidth + margin)
            let w = Math.round((width + this.margin[0]) / (colWidth + this.margin[0]));
            let h = 0;
            if (!autoSizeFlag) {
                h = Math.round((height + this.margin[1]) / (this.rowHeight + this.margin[1]));
            } else {
                h = Math.ceil((height + this.margin[1]) / (this.rowHeight + this.margin[1]));
            }

            // Capping
            w = Math.max(Math.min(w, this.cols - this.innerX), 0);
            h = Math.max(Math.min(h, this.maxRows - this.innerY), 0);
            return { w, h };
        },
        updateWidth: function (width, colNum) {
            this.containerWidth = width;
            if (colNum !== undefined && colNum !== null) {
                this.cols = colNum;
            }
        },
        compact: function () {
            this.createStyle();
        },
        tryMakeDraggable: function () {
            const self = this;
            if (this.interactObj === null || this.interactObj === undefined) {
                this.interactObj = interact(this.$refs.item);
                if (!this.useStyleCursor) {
                    this.interactObj.styleCursor(false);
                }
            }
            if (this.draggable && !this.static) {
                const opts = {
                    ignoreFrom: this.dragIgnoreFrom,
                    allowFrom: this.dragAllowFrom,
                };
                this.interactObj.draggable(opts);
                /*this.interactObj.draggable({allowFrom: '.vue-draggable-handle'});*/
                if (!this.dragEventSet) {
                    this.dragEventSet = true;
                    this.interactObj.on("dragstart dragmove dragend", function (event) {
                        self.handleDrag(event);
                    });
                }
            } else {
                this.interactObj.draggable({
                    enabled: false,
                });
            }
        },
        tryMakeResizable: function () {
            const self = this;
            if (this.interactObj === null || this.interactObj === undefined) {
                this.interactObj = interact(this.$refs.item);
                if (!this.useStyleCursor) {
                    this.interactObj.styleCursor(false);
                }
            }
            if (this.resizable && !this.static) {
                let maximum = this.calcPosition(0, 0, this.maxW, this.maxH);
                let minimum = this.calcPosition(0, 0, this.minW, this.minH);

                // console.log("### MAX " + JSON.stringify(maximum));
                // console.log("### MIN " + JSON.stringify(minimum));

                const opts = {
                    // allowFrom: "." + this.resizableHandleClass.trim().replace(" ", "."),
                    edges: {
                        top: ".vue-resizable-handle.h-n",
                        left: ".vue-resizable-handle.h-w",
                        right: ".vue-resizable-handle.h-e",
                        bottom: ".vue-resizable-handle.h-s",
                    },
                    // ignoreFrom: this.resizeIgnoreFrom,
                    restrictSize: {
                        min: {
                            height: minimum.height,
                            width: minimum.width,
                        },
                        max: {
                            height: maximum.height,
                            width: maximum.width,
                        },
                    },
                    modifiers: [],
                };

                if (this.preserveAspectRatio) {
                    opts.modifiers = [
                        interact.modifiers.aspectRatio({
                            ratio: "preserve",
                        }),
                    ];
                }

                this.interactObj.resizable(opts);
                if (!this.resizeEventSet) {
                    this.resizeEventSet = true;
                    this.interactObj.on("resizestart resizemove resizeend", function (event) {
                        self.handleResize(event);
                    });
                }
            } else {
                this.interactObj.resizable({
                    enabled: false,
                });
            }
        },
        autoSize: function () {
            // ok here we want to calculate if a resize is needed
            this.previousW = this.innerW;
            this.previousH = this.innerH;

            let newSize = this.$slots.default[0].elm.getBoundingClientRect();
            let pos = this.calcWH(newSize.height, newSize.width, true);
            if (pos.w < this.minW) {
                pos.w = this.minW;
            }
            if (pos.w > this.maxW) {
                pos.w = this.maxW;
            }
            if (pos.h < this.minH) {
                pos.h = this.minH;
            }
            if (pos.h > this.maxH) {
                pos.h = this.maxH;
            }

            if (pos.h < 1) {
                pos.h = 1;
            }
            if (pos.w < 1) {
                pos.w = 1;
            }

            // this.lastW = x; // basically, this is copied from resizehandler, but shouldn't be needed
            // this.lastH = y;

            if (this.innerW !== pos.w || this.innerH !== pos.h) {
                this.$emit("resize", this.i, pos.h, pos.w, newSize.height, newSize.width);
            }
            if (this.previousW !== pos.w || this.previousH !== pos.h) {
                this.$emit("resized", this.i, pos.h, pos.w, newSize.height, newSize.width);
                this.eventBus.$emit("resizeEvent", "resizeend", this.i, this.innerX, this.innerY, pos.h, pos.w);
            }
        },
    },
};
</script>
