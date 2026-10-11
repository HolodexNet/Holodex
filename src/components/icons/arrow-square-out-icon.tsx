import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowSquareOutIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-square-out
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowSquareOutIcon = (props: ArrowSquareOutIconProps) => {
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
        d="M224 104a8 8 0 0 1-16 0V59.32l-66.33 66.34a8 8 0 0 1-11.32-11.32L196.68 48H152a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm-40 24a8 8 0 0 0-8 8v72H48V80h72a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-72a8 8 0 0 0-8-8"
      />
    </svg>
  );
};
