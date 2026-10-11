import * as React from "react";
import type { SVGProps } from "react";
export interface ClockCounterClockwiseIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * clock-counter-clockwise
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ClockCounterClockwiseIcon = (
  props: ClockCounterClockwiseIconProps,
) => {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "1em"}
      height={props.size || "1em"}
      {...props}
    >
      <path
        fill="currentColor"
        d="M136 80v43.47l36.12 21.67a8 8 0 0 1-8.24 13.72l-40-24A8 8 0 0 1 120 128V80a8 8 0 0 1 16 0m-8-48a95.44 95.44 0 0 0-67.92 28.15C52.81 67.51 46.35 74.59 40 82V64a8 8 0 0 0-16 0v40a8 8 0 0 0 8 8h40a8 8 0 0 0 0-16H49c7.15-8.42 14.27-16.35 22.39-24.57a80 80 0 1 1 1.66 114.75a8 8 0 1 0-11 11.64A96 96 0 1 0 128 32"
      />
    </svg>
  );
};
