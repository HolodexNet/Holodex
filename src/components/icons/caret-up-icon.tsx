import * as React from "react";
import type { SVGProps } from "react";
export interface CaretUpIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * caret-up
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CaretUpIcon = (props: CaretUpIconProps) => {
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
        d="M213.66 165.66a8 8 0 0 1-11.32 0L128 91.31l-74.34 74.35a8 8 0 0 1-11.32-11.32l80-80a8 8 0 0 1 11.32 0l80 80a8 8 0 0 1 0 11.32"
      />
    </svg>
  );
};
