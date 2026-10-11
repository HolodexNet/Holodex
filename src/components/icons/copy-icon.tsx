import * as React from "react";
import type { SVGProps } from "react";
export interface CopyIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * copy
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CopyIcon = (props: CopyIconProps) => {
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
        d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"
      />
    </svg>
  );
};
