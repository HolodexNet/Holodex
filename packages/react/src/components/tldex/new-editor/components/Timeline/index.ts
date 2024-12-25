import { formatDuration } from "@/lib/time";
import bs from "binary-search";

export interface TimelineOptions {
  colors: {
    selected: string;
    active: string;
    hover: string;
    default: string;
    background: string;
    text: string;
    tooltip: string;
    scrollTrack: string;
    scrollThumb: string;
    timeCursor: string;
    timeGrid: string;
  };
  autoScroll: boolean;
}

export interface TimelineBlock {
  x: number;
  y: number;
  width: number;
  text: string;
  selected: boolean;
  active: boolean;
  message: ParsedScripterMessage;
  isHovered: boolean;
  draw: (context: CanvasRenderingContext2D) => void;
}

export class Timeline {
  private static readonly LINE_HEIGHT = 30;
  private static readonly TRACK_HEIGHT = 40;
  private static readonly TIMELINE_HEIGHT = 90;
  private static readonly SCROLL_BAR_HEIGHT = 10;
  private readonly WAVEFORM_HEIGHT = 60;
  private readonly WAVEFORM_Y_OFFSET = 20;

  private ctx: CanvasRenderingContext2D;
  private bgCtx: CanvasRenderingContext2D;
  private blocks: TimelineBlock[] = [];
  private zoomLevel: number;
  private shift = 0;
  private minimumZoomLevel: number;
  private maximumZoomLevel: number;
  private animationId?: number;

  private isMouseDown = false;
  private scrolling = false;
  private resizingBlock = false;
  private movingBlock = false;
  private swiping = false;

  private currentBlock?: TimelineBlock;
  private currentBlockIndex = -1;
  private hoveredBlockIndex = -1;
  private resizeEdge: "left" | "right" | null = null;
  private waveformData?: [number, number][];

  constructor(
    private canvas: HTMLCanvasElement,
    private bgCanvas: HTMLCanvasElement,
    private subtitleBlocks: ParsedScripterMessage[],
    private endTime: number,
    private getPlayer: () => { currentTime: number }, // a callback to get the player time, used to draw the current time cursor
    private updateSubtitles: (subtitleBlocks: ParsedScripterMessage[]) => void,
    // a callback to update the subtitles, will update the entire array
    private changeZoomLevel: (zoom: number) => void,
    // private changeShift: (shift: number) => void,
    private onAreaChange: (begin: number, end: number) => void,
    private options: TimelineOptions,
    private onTimeSet: (time: number) => void, // a callback to set the player time, but don't necessarily need to start playback
    private onTimeSetAndPlay: (time: number) => void, // a callback to set the player time and start playback
  ) {
    console.log("[Timeline] Creating Timeline");
    console.log(canvas, bgCanvas);

    // this.handleMouseMove = this.handleMouseMove.bind(this);
    // this.handleMouseDown = this.handleMouseDown.bind(this);
    // this.handleMouseUp = this.handleMouseUp.bind(this);
    // this.handleWheel = this.handleWheel.bind(this);
    // this.handleDoubleClick = this.handleDoubleClick.bind(this);
    // this.animate = this.animate.bind(this);

    const ctx = canvas.getContext("2d");
    const bgCtx = bgCanvas.getContext("2d");

    if (!ctx || !bgCtx) {
      throw new Error("Canvas context not available");
    }

    this.ctx = ctx;
    this.bgCtx = bgCtx;
    this.endTime = endTime;
    console.log("[Timeline] endTime", endTime);

    this.setupCanvasSize();
    this.minimumZoomLevel = this.canvas.width / endTime;
    this.maximumZoomLevel = 13 * endTime;
    this.zoomLevel = this.minimumZoomLevel;

    this.setData(subtitleBlocks);
    this.setupEventListeners();
    this.drawBackground();
    this.startAnimation();
  }

  private setupCanvasSize() {
    const updateSize = () => {
      const parent = this.canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      [this.canvas, this.bgCanvas].forEach((canvas) => {
        canvas.width = width;
        canvas.height = Timeline.TIMELINE_HEIGHT;
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
  }

  private createBlock(message: ParsedScripterMessage): TimelineBlock {
    const block: TimelineBlock = {
      x: message.video_offset * this.zoomLevel,
      y: Timeline.LINE_HEIGHT,
      width: (message.duration || 0) * this.zoomLevel,
      text: message.message,
      selected: false,
      active: false,
      message,
      isHovered: false,
      draw: (ctx: CanvasRenderingContext2D) => {
        const x = block.x + this.shift;
        ctx.fillStyle = block.selected
          ? this.options.colors.selected
          : block.active
            ? this.options.colors.active
            : block.isHovered
              ? this.options.colors.hover
              : this.options.colors.default;

        ctx.fillRect(x, block.y, block.width, Timeline.TRACK_HEIGHT);
        ctx.fillStyle = this.options.colors.text;
        ctx.font = "12px Arial";
        ctx.textBaseline = "middle";

        const textY = block.y + Timeline.TRACK_HEIGHT / 2;
        const padding = 5;
        const maxWidth = block.width - padding * 2;

        let text = block.text;
        while (ctx.measureText(text).width > maxWidth && text.length > 3) {
          text = text.slice(0, -4) + "...";
        }

        ctx.fillText(text, x + padding, textY, maxWidth);
      },
    };

    return block;
  }

  private setZoom(newZoom: number) {
    console.log("[Timeline] Setting zoom level to", newZoom);
    this.zoomLevel = Math.min(
      Math.max(this.minimumZoomLevel, newZoom),
      this.maximumZoomLevel,
    );

    this.checkShift();
    this.setData(this.subtitleBlocks);

    // this.changeZoomLevel(this.zoomLevel);
  }

  private drawBackground() {
    this.bgCtx.fillStyle = this.options.colors.background;
    this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

    const DENSITY_FACTOR = 4; // Increase this number to reduce density
    const viewportTimeRange = this.bgCanvas.width / this.zoomLevel;
    const baseSpacing = Math.pow(
      10,
      Math.floor(Math.log10(viewportTimeRange / DENSITY_FACTOR)),
    );
    const majorSpacing = baseSpacing * this.zoomLevel;
    const minorSpacing = majorSpacing / 5;

    const startTime = -this.shift / this.zoomLevel;
    const endTime = (this.bgCanvas.width - this.shift) / this.zoomLevel;
    const majorStart = Math.floor(startTime / baseSpacing) * baseSpacing;
    const majorEnd = Math.ceil(endTime / baseSpacing) * baseSpacing;

    this.bgCtx.strokeStyle = this.options.colors.timeGrid;
    this.bgCtx.beginPath();

    for (let time = majorStart; time <= majorEnd; time += baseSpacing) {
      const x = time * this.zoomLevel + this.shift;
      if (x >= 0 && x <= this.bgCanvas.width) {
        this.bgCtx.lineWidth = 1;
        this.bgCtx.moveTo(x, 0);
        this.bgCtx.lineTo(x, this.bgCanvas.height - Timeline.SCROLL_BAR_HEIGHT);

        this.bgCtx.fillStyle = this.options.colors.text;
        this.bgCtx.textAlign = "left";
        this.bgCtx.fillText(formatDuration(time * 1000), x + 2, 10);

        for (let j = 1; j < 5; j++) {
          const minorX = x + j * minorSpacing;
          if (minorX <= this.bgCanvas.width) {
            this.bgCtx.moveTo(minorX, 0);
            this.bgCtx.lineTo(minorX, Timeline.SCROLL_BAR_HEIGHT);
          }
        }
      }
    }

    this.bgCtx.stroke();
    this.drawWaveform();
  }

  private drawWaveform() {
    if (!this.waveformData?.length) return;

    const startTime = -this.shift / this.zoomLevel;
    const endTime = (this.bgCanvas.width - this.shift) / this.zoomLevel;

    const startIndex = Math.abs(
      bs(
        this.waveformData,
        startTime,
        (element, needle) => element[0] - needle,
      ),
    );

    const endIndex = Math.abs(
      bs(this.waveformData, endTime, (element, needle) => element[0] - needle),
    );

    const visibleData = this.waveformData.slice(
      Math.max(0, startIndex - 1),
      Math.min(this.waveformData.length, endIndex + 1),
    );

    if (!visibleData.length) return;

    this.bgCtx.strokeStyle = this.options.colors.timeGrid;
    this.bgCtx.lineWidth = 1;
    this.bgCtx.beginPath();

    visibleData.forEach(([time, db], index) => {
      const x = time * this.zoomLevel + this.shift;
      const normalizedDb = Math.min(Math.max(db / -60, 0), 1);
      const amplitude = normalizedDb * this.WAVEFORM_HEIGHT;

      if (index === 0) {
        this.bgCtx.moveTo(
          x,
          this.WAVEFORM_Y_OFFSET + this.WAVEFORM_HEIGHT / 2 - amplitude / 2,
        );
      } else {
        this.bgCtx.lineTo(
          x,
          this.WAVEFORM_Y_OFFSET + this.WAVEFORM_HEIGHT / 2 - amplitude / 2,
        );
      }
    });

    this.bgCtx.stroke();
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const beginTime = -this.shift / this.zoomLevel;
    const endTime = (this.canvas.width - this.shift) / this.zoomLevel;

    this.blocks.forEach((block) => {
      const blockBeginTime = block.x / this.zoomLevel;
      const blockEndTime = (block.x + block.width) / this.zoomLevel;

      if (blockEndTime >= beginTime && blockBeginTime <= endTime) {
        block.draw(this.ctx);
      }
    });

    this.drawTimeCursor();
    this.drawScrollbar();

    this.onAreaChange(beginTime, endTime);
    this.animationId = requestAnimationFrame(this.animate);
  };

  private drawTimeCursor() {
    const player = this.getPlayer();
    const x = player.currentTime * this.zoomLevel + this.shift;

    this.ctx.strokeStyle = this.options.colors.timeCursor;
    this.ctx.beginPath();
    this.ctx.moveTo(x, 0);
    this.ctx.lineTo(x, this.canvas.height - Timeline.SCROLL_BAR_HEIGHT);
    this.ctx.stroke();
  }

  private drawScrollbar() {
    const totalWidth = this.endTime * this.zoomLevel;
    const viewportRatio = this.canvas.width / totalWidth;
    const thumbWidth = Math.max(20, this.canvas.width * viewportRatio);
    const thumbX = (-this.shift / totalWidth) * this.canvas.width;

    const y = this.canvas.height - Timeline.SCROLL_BAR_HEIGHT;

    this.ctx.fillStyle = this.options.colors.scrollTrack;
    this.ctx.fillRect(0, y, this.canvas.width, Timeline.SCROLL_BAR_HEIGHT);

    this.ctx.fillStyle = this.options.colors.scrollThumb;
    this.ctx.fillRect(thumbX, y, thumbWidth, Timeline.SCROLL_BAR_HEIGHT);
  }

  public setData(subs: ParsedScripterMessage[]) {
    this.blocks = subs.map(this.createBlock);
    this.subtitleBlocks = subs;
    this.cancelAnimation();
    this.animate();
  }

  public cancelAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  public changeZoom(newZoom: number) {
    this.setZoom(newZoom);
    this.drawBackground();
  }

  /**
   * Adjusts the viewport to center around a specific time.
   *
   * @param time - The time to center the viewport on, in the timeline's time unit.
   *
   * This function calculates the new position of the viewport such that the specified
   * time is centered horizontally on the canvas. It updates the `shift` value accordingly,
   * redraws the background, and applies the new shift.
   */
  public centerTimeOnCanvas(time: number) {
    const x = time * this.zoomLevel;
    this.shift = -x + this.canvas.width / 2;
    this.checkShift();
    // this.drawBackground();
    // this.changeShift(this.shift);
  }

  public loadWaveform(data: [number, number][]) {
    this.waveformData = data;
    this.drawBackground();
  }
  /**
   * Ensures that the current shift value is within allowable limits.
   * The shift is constrained between a maximum value (0) and a minimum value,
   * which is calculated based on the total width of the timeline and the canvas width.
   * This function adjusts the shift to prevent scrolling beyond the timeline's bounds.
   */
  private checkShift() {
    const maxShift = 0;
    const minShift = -(this.endTime * this.zoomLevel - this.canvas.width);
    this.shift = Math.min(maxShift, Math.max(minShift, this.shift));
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("wheel", this.handleWheel);
    this.canvas.addEventListener("dblclick", this.handleDoubleClick);
  }

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.scrolling) {
      this.handleScrollDrag(x);
    } else if (this.movingBlock && this.currentBlock) {
      this.handleBlockMove(x);
    } else if (this.resizingBlock && this.currentBlock) {
      this.handleBlockResize(x);
    } else if (this.swiping) {
      this.handleSwipe(x);
    } else {
      this.updateHoverStates(x, y);
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.isMouseDown = true;

    if (y >= this.canvas.height - Timeline.SCROLL_BAR_HEIGHT) {
      this.scrolling = true;
    } else {
      const block = this.findBlockAtPosition(x, y);
      if (block) {
        const [index, edge] = this.getBlockAndEdge(block, x);
        if (edge) {
          this.startResizing(index, edge);
        } else {
          this.startMoving(index);
        }
      } else {
        this.swiping = true;
        this.lastX = x;
      }
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (this.movingBlock || this.resizingBlock) {
      this.finalizeBlockChange();
    }

    const rect = this.canvas.getBoundingClientRect();
    if (!this.resizingBlock && !this.movingBlock && !this.scrolling) {
      // find out the time at the mouse position and go to that time
      const mouseTime = (e.clientX - rect.left - this.shift) / this.zoomLevel;
      this.onTimeSet(mouseTime);
    }

    this.isMouseDown = false;
    this.scrolling = false;
    this.movingBlock = false;
    this.resizingBlock = false;
    this.swiping = false;
    this.currentBlock = undefined;
    this.currentBlockIndex = -1;
    this.resizeEdge = null;
  };

  private handleWheel = (e: WheelEvent) => {
    // console.log("handleWheel");
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.zoomLevel * zoomFactor;

    // if (newZoom >= this.minimumZoomLevel) {
    const timeAtMouse = (x - this.shift) / this.zoomLevel;

    this.setZoom(newZoom);
    this.shift = x - timeAtMouse * this.zoomLevel;
    this.checkShift();
    console.log("Zoom level:", this.zoomLevel, "Shift:", this.shift);

    // this.checkShift();
    this.drawBackground();
    // }
  };

  private handleDoubleClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const block = this.findBlockAtPosition(x, y);
    if (block) {
      const time = block.x / this.zoomLevel;
      this.onTimeSetAndPlay(time);
    }
  };

  private findBlockAtPosition(x: number, y: number): TimelineBlock | undefined {
    return this.blocks.find((block) => {
      const blockX = block.x + this.shift;
      return (
        x >= blockX &&
        x <= blockX + block.width &&
        y >= block.y &&
        y <= block.y + Timeline.TRACK_HEIGHT
      );
    });
  }

  private getBlockAndEdge(
    block: TimelineBlock,
    x: number,
  ): [number, "left" | "right" | null] {
    const index = this.blocks.indexOf(block);
    const blockX = block.x + this.shift;
    const edgeThreshold = 5;

    if (Math.abs(x - blockX) <= edgeThreshold) {
      return [index, "left"];
    } else if (Math.abs(x - (blockX + block.width)) <= edgeThreshold) {
      return [index, "right"];
    }

    return [index, null];
  }

  private startResizing(index: number, edge: "left" | "right") {
    this.currentBlockIndex = index;
    this.currentBlock = this.blocks[index];
    this.resizingBlock = true;
    this.resizeEdge = edge;
  }

  private startMoving(index: number) {
    this.currentBlockIndex = index;
    this.currentBlock = this.blocks[index];
    this.movingBlock = true;
  }

  private handleScrollDrag(x: number) {
    const totalWidth = this.endTime * this.zoomLevel;
    const ratio = totalWidth / this.canvas.width;
    this.shift = -x * ratio;
    this.checkShift();
    this.drawBackground();
    // this.changeShift(this.shift);
  }

  private handleBlockMove(x: number) {
    if (!this.currentBlock) return;
    const newX = x - this.shift - this.currentBlock.width / 2;
    this.currentBlock.x = Math.max(0, newX);

    // Update message timestamp
    this.currentBlock.message.video_offset =
      this.currentBlock.x / this.zoomLevel;
    this.currentBlock.message.end =
      this.currentBlock.message.video_offset +
      (this.currentBlock.message.duration || 0);
  }

  private handleBlockResize(x: number) {
    if (!this.currentBlock || !this.resizeEdge) return;

    const blockX = this.currentBlock.x + this.shift;
    const dx = x - blockX;

    if (this.resizeEdge === "right") {
      this.currentBlock.width = Math.max(10, dx);
      this.currentBlock.message.duration =
        this.currentBlock.width / this.zoomLevel;
      this.currentBlock.message.end =
        this.currentBlock.message.video_offset +
        this.currentBlock.message.duration;
    } else {
      const originalRight = this.currentBlock.x + this.currentBlock.width;
      const newX = Math.max(0, x - this.shift);
      this.currentBlock.x = newX;
      this.currentBlock.width = originalRight - newX;

      this.currentBlock.message.video_offset =
        this.currentBlock.x / this.zoomLevel;
      this.currentBlock.message.duration =
        this.currentBlock.width / this.zoomLevel;
      this.currentBlock.message.end =
        this.currentBlock.message.video_offset +
        this.currentBlock.message.duration;
    }
  }
  private handleSwipe(x: number) {
    const dx = x - this.lastX;
    this.shift += dx;
    this.checkShift();
    this.drawBackground();
    // this.changeShift(this.shift);
    this.lastX = x;
  }

  private updateHoverStates(x: number, y: number) {
    let hoveredBlock: TimelineBlock | undefined;
    let hoveredIndex = -1;

    this.blocks.forEach((block, index) => {
      const blockX = block.x + this.shift;
      const isHovered =
        x >= blockX &&
        x <= blockX + block.width &&
        y >= block.y &&
        y <= block.y + Timeline.TRACK_HEIGHT;

      block.isHovered = isHovered;
      if (isHovered) {
        hoveredBlock = block;
        hoveredIndex = index;
      }
    });

    if (hoveredBlock) {
      const edge = this.getEdgeAtPosition(hoveredBlock, x);
      this.canvas.style.cursor = edge ? "ew-resize" : "move";
    } else {
      this.canvas.style.cursor = "default";
    }

    this.hoveredBlockIndex = hoveredIndex;
  }

  private getEdgeAtPosition(
    block: TimelineBlock,
    x: number,
  ): "left" | "right" | null {
    const blockX = block.x + this.shift;
    const edgeThreshold = 5;

    if (Math.abs(x - blockX) <= edgeThreshold) return "left";
    if (Math.abs(x - (blockX + block.width)) <= edgeThreshold) return "right";
    return null;
  }

  private finalizeBlockChange() {
    if (!this.currentBlock || this.currentBlockIndex === -1) return;

    const blocks = this.blocks.map((b) => b.message);

    this.updateSubtitles(blocks);
  }

  private startAnimation() {
    this.animate();
  }

  private lastX = 0;

  public destroy() {
    this.cancelAnimation();
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.canvas.removeEventListener("dblclick", this.handleDoubleClick);
  }
}
