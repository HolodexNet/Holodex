import * as React from "react";
import type { SVGProps } from "react";
export interface RowsIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * rows
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const RowsIcon = (props: RowsIconProps) => {
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
        d="M208 136H48a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-40a16 16 0 0 0-16-16m0 56H48v-40h160zm0-144H48a16 16 0 0 0-16 16v40a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 56H48V64h160z"
      />
    </svg>
  );
};
