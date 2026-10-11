import * as React from "react";
import type { SVGProps } from "react";
export interface ChevronDownIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * chevron-down
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ChevronDownIcon = (props: ChevronDownIconProps) => {
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
        d="m213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32"
      />
    </svg>
  );
};
