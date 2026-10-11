import * as React from "react";
import type { SVGProps } from "react";
export interface MoreIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * more
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MoreIcon = (props: MoreIconProps) => {
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
        d="M140 128a12 12 0 1 1-12-12a12 12 0 0 1 12 12m56-12a12 12 0 1 0 12 12a12 12 0 0 0-12-12m-136 0a12 12 0 1 0 12 12a12 12 0 0 0-12-12"
      />
    </svg>
  );
};
