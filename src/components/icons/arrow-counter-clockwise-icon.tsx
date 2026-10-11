import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowCounterClockwiseIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-counter-clockwise
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowCounterClockwiseIcon = (
  props: ArrowCounterClockwiseIconProps,
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
        d="M224 128a96 96 0 0 1-94.71 96H128a95.38 95.38 0 0 1-65.9-26.2a8 8 0 0 1 11-11.63a80 80 0 1 0-1.67-114.78a3 3 0 0 1-.26.25L44.59 96H72a8 8 0 0 1 0 16H24a8 8 0 0 1-8-8V56a8 8 0 0 1 16 0v29.8L60.25 60A96 96 0 0 1 224 128"
      />
    </svg>
  );
};
