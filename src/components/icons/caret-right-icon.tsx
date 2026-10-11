import * as React from "react";
import type { SVGProps } from "react";
export interface CaretRightIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * caret-right
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CaretRightIcon = (props: CaretRightIconProps) => {
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
        d="m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32"
      />
    </svg>
  );
};
