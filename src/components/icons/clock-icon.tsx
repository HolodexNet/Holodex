import * as React from "react";
import type { SVGProps } from "react";
export interface ClockIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * clock
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ClockIcon = (props: ClockIconProps) => {
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
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m64-88a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
