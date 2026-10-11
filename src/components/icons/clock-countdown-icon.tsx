import * as React from "react";
import type { SVGProps } from "react";
export interface ClockCountdownIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * clock-countdown
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ClockCountdownIcon = (props: ClockCountdownIconProps) => {
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
        d="M232 136.66A104.12 104.12 0 1 1 119.34 24a8 8 0 0 1 1.32 16A88.12 88.12 0 1 0 216 135.34a8 8 0 0 1 16 1.32M120 72v56a8 8 0 0 0 8 8h56a8 8 0 0 0 0-16h-48V72a8 8 0 0 0-16 0m40-24a12 12 0 1 0-12-12a12 12 0 0 0 12 12m36 24a12 12 0 1 0-12-12a12 12 0 0 0 12 12m24 36a12 12 0 1 0-12-12a12 12 0 0 0 12 12"
      />
    </svg>
  );
};
