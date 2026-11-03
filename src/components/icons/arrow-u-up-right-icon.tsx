import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowUUpRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-u-up-right
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowUUpRightIcon = (props: ArrowUUpRightIconProps) => {
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
        d="M170.34 130.34L204.69 96H88a48 48 0 0 0 0 96h88a8 8 0 0 1 0 16H88a64 64 0 0 1 0-128h116.69l-34.35-34.34a8 8 0 0 1 11.32-11.32l48 48a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32-11.32"
      />
    </svg>
  );
};
