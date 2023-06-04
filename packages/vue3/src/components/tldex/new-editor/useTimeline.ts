// useTimeline describes timeline-specific display logic, such as the rotation of three Canvas elements.

import { ParsedMessage } from "@/stores/socket_types";
import { useElementSize } from "@vueuse/core";
import Timeline from "@losting/timeline";
import { gte } from "sorted-array-functions";
import { ChatDB } from "../core/ChatDB";

interface TimelineResources {
  containerRef: Ref<HTMLElement | null>;
  canvasRef: Ref<HTMLCanvasElement | null>;
  containerSize: {
    width: Ref<number>;
    height: Ref<number>;
  };
  currentSubs: Ref<ParsedMessage[]>;
  allSubs: Ref<ParsedMessage[]>;
  startTime: Ref<number>;
  endTime: Ref<number>;
}

export function useTimelineRendererBase(
  list: Ref<ParsedMessage[]>,
  waveform: Ref<[number, number][] | undefined>,
  currentTime: Ref<number>
): TimelineResources {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const containerRef = ref<HTMLElement | null>(null);
  const containerSize = useElementSize(containerRef);

  const allSubs = shallowRef(list);
  const startTime = ref<number>(0);
  const endTime = ref<number>(1);

  const timeline: Ref<Timeline | null> = computed(() => {
    if (canvasRef.value) {
      const t = new Timeline(canvasRef.value as HTMLCanvasElement, {
        fps: 120,
        maxZoom: 8,
        minZoom: 1,
        fill: true,
        scaleSpacing: 80,
        textColor: "#eee",
        pointColor: "#0c9",
        pointWidth: 4,
      });

      console.log(t);

      t.on("drag", (s) => {
        // console.log("drag", s[0], s[1]);
        startTime.value = s[0];
        endTime.value = s[1];
      });

      t.on("timeUpdate", (v: [number, number, number]) => {
        // console.log("timeUpdate", v[1], v[2]);
        startTime.value = v[1];
        endTime.value = v[2];
        currentTime.value = v[0];
      });

      return t;
    }
    return null;
  });

  watchEffect(
    () => {
      const x = timeline.value?.draw({
        currentTime: currentTime.value,
        waveform: waveform.value || [],
      });
      if (x) {
        // console.log("draw:", x.startTime, x.endTime);
        startTime.value = x.startTime;
        endTime.value = x.endTime;
      }
    },
    { flush: "sync" }
  );

  const currentSubs = computed(() => {
    const lower = gte(
      allSubs.value,
      { video_offset: startTime.value - 10 } as any,
      ChatDB.ParsedMessageOFFSETComparator
    );
    const upper = gte(
      allSubs.value,
      { video_offset: endTime.value + 10 } as any,
      ChatDB.ParsedMessageOFFSETComparator
    );
    // console.log(
    //   lower,
    //   allSubs.value[lower]?.video_offset,
    //   startTime.value,
    //   upper,
    //   allSubs.value[upper]?.video_offset,
    //   endTime.value
    // );

    return allSubs.value.slice(lower, upper < 0 ? undefined : upper);
  });

  return {
    containerRef,
    containerSize,
    allSubs,
    currentSubs,
    startTime,
    endTime,
    canvasRef,
  };
}
