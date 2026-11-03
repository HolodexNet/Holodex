import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowUUpLeftIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-u-up-left
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowUUpLeftIcon = (props: ArrowUUpLeftIconProps) => {
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
        d="M232 144a64.07 64.07 0 0 1-64 64H80a8 8 0 0 1 0-16h88a48 48 0 0 0 0-96H51.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L51.31 80H168a64.07 64.07 0 0 1 64 64"
      />
    </svg>
  );
};
