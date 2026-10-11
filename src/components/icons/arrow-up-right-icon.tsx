import * as React from "react";
import type { SVGProps } from "react";
export interface ArrowUpRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * arrow-up-right
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ArrowUpRightIcon = (props: ArrowUpRightIconProps) => {
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
        d="M200 64v104a8 8 0 0 1-16 0V83.31L69.66 197.66a8 8 0 0 1-11.32-11.32L172.69 72H88a8 8 0 0 1 0-16h104a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
