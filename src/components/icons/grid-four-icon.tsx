import * as React from "react";
import type { SVGProps } from "react";
export interface GridFourIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * grid-four
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const GridFourIcon = (props: GridFourIconProps) => {
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
        d="M200 40H56a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m0 80h-64V56h64Zm-80-64v64H56V56Zm-64 80h64v64H56Zm144 64h-64v-64h64z"
      />
    </svg>
  );
};
