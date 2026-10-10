import * as React from "react";
import type { SVGProps } from "react";
export interface MagnifyingGlassIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * magnifying-glass
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MagnifyingGlassIcon = (props: MagnifyingGlassIconProps) => {
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
        d="m229.66 218.34l-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32M40 112a72 72 0 1 1 72 72a72.08 72.08 0 0 1-72-72"
      />
    </svg>
  );
};
