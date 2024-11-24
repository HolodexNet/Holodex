import React from "react";
import { Rnd } from "react-rnd";
import { useSpecificSubtitle } from "../hooks/subtitles";

/**
 * Properties for the RndSubtitle component.
 *
 * @property {string} subtitleId Unique identifier for the subtitle.
 * @property {number} startTime Start time of the timeline range for the subtitle.
 * @property {number} endTime End time of the timeline range for the subtitle.
 * @property {number} containerWidth Width of the container in which the subtitle is displayed.
 */
interface RndSubtitleProps {
  subtitleId: string;
  startTime: number;
  endTime: number;
  containerWidth: number;
}
/**
 * RndSubtitle is a resizable and draggable subtitle component for editing video subtitles.
 * It utilizes the react-rnd library to allow users to adjust the position
 * and duration of a subtitle by dragging or resizing the subtitle box.
 *
 * Props:
 * - subtitleId: Unique identifier for the subtitle.
 * - startTime: Start time of the timeline range for the subtitle.
 * - endTime: End time of the timeline range for the subtitle.
 * - containerWidth: Width of the container in which the subtitle is displayed.
 *
 * The component provides internal functions to convert time to position and vice versa,
 * and handlers to update subtitle start time and duration upon dragging or resizing.
 */
export const RndSubtitle: React.FC<RndSubtitleProps> = ({
  subtitleId,
  startTime,
  endTime,
  containerWidth,
}) => {
  const [subtitle, edit] = useSpecificSubtitle(subtitleId);

  const timeToPosition = (time: number) => {
    const timeRange = endTime - startTime;
    const position = ((time - startTime) / timeRange) * containerWidth;
    return position;
  };

  const positionToTime = (position: number) => {
    const timeRange = endTime - startTime;
    const time = (position / containerWidth) * timeRange + startTime;
    return Math.max(startTime, Math.min(time, endTime));
  };

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    const newStartTime = positionToTime(d.x);
    edit({
      type: "UPDATE_SUBTITLE",
      payload: {
        ...subtitle,
        video_offset: newStartTime,
        end: newStartTime + subtitle.duration / 1000,
      },
    });
  };

  const handleResize = (_: unknown, _direction: string, ref: HTMLElement) => {
    const newWidth = ref.offsetWidth;
    const newDuration =
      (newWidth / containerWidth) * (endTime - startTime) * 1000;
    edit({
      type: "UPDATE_SUBTITLE",
      payload: {
        ...subtitle,
        duration: newDuration,
        end: subtitle.video_offset + newDuration / 1000,
      },
    });
  };

  return (
    <Rnd
      position={{
        x: timeToPosition(subtitle.video_offset),
        y: 15,
      }}
      size={{
        width:
          timeToPosition(
            subtitle.video_offset + (subtitle.duration || 3000) / 1000,
          ) - timeToPosition(subtitle.video_offset),
        height: 30,
      }}
      onDragStop={handleDrag}
      onResize={handleResize}
      bounds="parent"
      className="border border-x-2 border-primary-9"
      enableResizing={{ left: true, right: true }}
    >
      <div
        className="h-full w-full cursor-move text-wrap bg-base-3 text-base-12 opacity-80 bg-blend-multiply"
        title={subtitle.message}
      >
        <span className="truncate text-xs text-white">{subtitle.message}</span>
      </div>
    </Rnd>
  );
};
