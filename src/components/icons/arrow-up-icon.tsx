import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowUpIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-up
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowUpIcon = (props: ArrowUpIconProps) => {
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
        d="M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32"
      />
    </svg>
  );
};
