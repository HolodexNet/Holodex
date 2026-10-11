import * as React from "react";
import type { SVGProps } from "react";
export interface MinusIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * minus
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MinusIcon = (props: MinusIconProps) => {
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
        d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
