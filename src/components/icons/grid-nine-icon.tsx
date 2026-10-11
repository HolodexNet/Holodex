import * as React from "react";
import type { SVGProps } from "react";
export interface GridNineIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * grid-nine
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const GridNineIcon = (props: GridNineIconProps) => {
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
        d="M216 48H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m-112 96v-32h48v32Zm48 16v32h-48v-32ZM40 112h48v32H40Zm64-16V64h48v32Zm64 16h48v32h-48Zm48-16h-48V64h48ZM88 64v32H40V64Zm-48 96h48v32H40Zm176 32h-48v-32h48z"
      />
    </svg>
  );
};
