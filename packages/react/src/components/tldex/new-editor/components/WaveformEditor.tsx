import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTimelineRendererBase } from "../hooks/timeline";
import { formatDuration } from "@/lib/time";
import { useWaveformGenerator } from "../hooks/waveform_generator";

import { formatBytes } from "@/lib/utils";
import { playerRefAtom, videoStatusAtomFamily } from "@/store/player";
import { useAtomValue } from "jotai";

import "./WaveformEditor.scss";

// import { useWaveformGenerator } from "./useWaveform"; // Placeholder, adjust according to actual implementation

// Assuming the useTimelineRendererBase hook has been correctly migrated and imported
const WaveformEditor = ({ videoId }: { videoId: string }) => {
  const player = useAtomValue(playerRefAtom);
  const {
    waveform,
    stage,
    progress,
    latchAndRun,
    format,
    totalSize,
    errorMessage,
  } = useWaveformGenerator();
  const videoStatusAtom = videoStatusAtomFamily(videoId || "x");
  const videoStatus = useAtomValue(videoStatusAtom);

  const {
    canvasCbRef,
    canvasRef,
    containerRef,
    currentSubs,
    startTime,
    endTime,
  } = useTimelineRendererBase(waveform, videoStatus);

  const init = () => {
    setTimeout(() => {
      latchAndRun(videoId);
      // Placeholder for actual init functionality
      console.log("Initializing with videoId:", videoId);
    }, 1000);
  };

  const message = useMemo(() => {
    switch (stage) {
      case "waiting":
        return "waiting...";
      case "downloading":
        return Math.round(progress) + "% of " + formatBytes(totalSize);
      case "transcoding":
        return "In progress: " + formatDuration(progress * 1000) + "...";
      case "done":
      case "error":
        return "";
    }
  }, [stage, progress, totalSize]);
  // Assuming msg and stage logic is handled internally or through props
  // const { msg, stage } = useWaveformGenerator(); // Placeholder for actual hook/logic

  return (
    <div
      className="flex w-full flex-col flex-nowrap"
      style={{ height: "200px" }}
    >
      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={videoStatus.duration}
          value={videoStatus.progress || 0}
          className="timeline-slider"
          step="0.1"
          onChange={
            (t) => {
              console.log("changing to", t.target.value);
              player?.seekTo(+t.target.value);
            } // Adjust according to actual player method
          }
        />
      </div>
      <div className="relative shrink grow" ref={containerRef}>
        <canvas
          className="w-full"
          style={{ height: "130px" }}
          ref={canvasCbRef}
        />
        {/* Waveform subtitles and interactions would be handled here */}
      </div>
      <div className="wf-status">
        {stage === "waiting" && (
          <a className="link" onClick={init}>
            Click here to Fetch audio information from youtube, this will use up
            20MB per hour of stream and take a minute or two depending on your
            internet speed.
          </a>
        )}
        {stage !== "done" && (
          <span>
            {stage}: {message} {errorMessage ? "?ERROR?: " + errorMessage : ""}
          </span>
        )}
      </div>
      <div className="w-full">
        <span>{formatDuration(startTime * 1000)}</span>
        <span className="float-right">{formatDuration(endTime * 1000)}</span>
      </div>
    </div>
  );
};

export default WaveformEditor;
