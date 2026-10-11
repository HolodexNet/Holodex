import * as React from "react";
import type { SVGProps } from "react";
export interface ListIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * list
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ListIcon = (props: ListIconProps) => {
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
        d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8M40 72h176a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m176 112H40a8 8 0 0 0 0 16h176a8 8 0 0 0 0-16"
      />
    </svg>
  );
};
