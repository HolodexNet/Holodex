import * as React from "react";
import type { SVGProps } from "react";
export interface RefreshIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * refresh
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const RefreshIcon = (props: RefreshIconProps) => {
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
        d="M240 56v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h27.4l-26.59-24.36l-.25-.24a80 80 0 1 0-1.67 114.78a8 8 0 0 1 11 11.63A95.44 95.44 0 0 1 128 224h-1.32a96 96 0 1 1 69.07-164L224 85.8V56a8 8 0 1 1 16 0"
      />
    </svg>
  );
};
