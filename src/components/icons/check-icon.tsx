import * as React from "react";
import type { SVGProps } from "react";
export interface CheckIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * check
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CheckIcon = (props: CheckIconProps) => {
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
        d="m229.66 77.66l-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69L218.34 66.34a8 8 0 0 1 11.32 11.32"
      />
    </svg>
  );
};
