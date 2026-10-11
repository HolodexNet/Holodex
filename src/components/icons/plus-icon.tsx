import * as React from "react";
import type { SVGProps } from "react";
export interface PlusIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * plus
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const PlusIcon = (props: PlusIconProps) => {
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
        d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
