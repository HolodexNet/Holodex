import * as React from "react";
import type { SVGProps } from "react";
export interface PauseIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * pause
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const PauseIcon = (props: PauseIconProps) => {
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
        d="M200 32h-40a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176h-40V48h40ZM96 32H56a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h40a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H56V48h40Z"
      />
    </svg>
  );
};
