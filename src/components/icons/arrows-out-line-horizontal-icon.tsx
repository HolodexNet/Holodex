import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowsOutLineHorizontalIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrows-out-line-horizontal
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowsOutLineHorizontalIcon = (
  props: ArrowsOutLineHorizontalIconProps,
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
        d="M136 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-40 80H35.31l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32l32 32a8 8 0 0 0 11.32-11.32L35.31 136H96a8 8 0 0 0 0-16m149.66 2.34l-32-32a8 8 0 0 0-11.32 11.32L220.69 120H160a8 8 0 0 0 0 16h60.69l-18.35 18.34a8 8 0 0 0 11.32 11.32l32-32a8 8 0 0 0 0-11.32"
      />
    </svg>
  );
};
