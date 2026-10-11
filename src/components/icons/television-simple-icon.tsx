import * as React from "react";
import type { SVGProps } from "react";
export interface TelevisionSimpleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * television-simple
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const TelevisionSimpleIcon = (props: TelevisionSimpleIconProps) => {
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
        d="M216 64h-68.69l34.35-34.34a8 8 0 1 0-11.32-11.32L128 60.69L85.66 18.34a8 8 0 0 0-11.32 11.32L108.69 64H40a16 16 0 0 0-16 16v120a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m0 136H40V80h176z"
      />
    </svg>
  );
};
