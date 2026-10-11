import * as React from "react";
import type { SVGProps } from "react";
export interface CaretLeftIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * caret-left
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CaretLeftIcon = (props: CaretLeftIconProps) => {
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
        d="M165.66 202.34a8 8 0 0 1-11.32 11.32l-80-80a8 8 0 0 1 0-11.32l80-80a8 8 0 0 1 11.32 11.32L91.31 128Z"
      />
    </svg>
  );
};
