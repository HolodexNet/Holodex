import * as React from "react";
import type { SVGProps } from "react";
export interface ClipboardTextIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * clipboard-text
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ClipboardTextIcon = (props: ClipboardTextIconProps) => {
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
        d="M168 152a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-8-40H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16m56-64v168a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V48a16 16 0 0 1 16-16h36.26a47.92 47.92 0 0 1 71.48 0H200a16 16 0 0 1 16 16M96 64h64a32 32 0 0 0-64 0m104-16h-26.75A47.9 47.9 0 0 1 176 64v8a8 8 0 0 1-8 8H88a8 8 0 0 1-8-8v-8a47.9 47.9 0 0 1 2.75-16H56v168h144Z"
      />
    </svg>
  );
};
