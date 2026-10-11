import * as React from "react";
import type { SVGProps } from "react";
export interface CaretUpDownIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * caret-up-down
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CaretUpDownIcon = (props: CaretUpDownIconProps) => {
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
        d="M181.66 170.34a8 8 0 0 1 0 11.32l-48 48a8 8 0 0 1-11.32 0l-48-48a8 8 0 0 1 11.32-11.32L128 212.69l42.34-42.35a8 8 0 0 1 11.32 0m-96-84.68L128 43.31l42.34 42.35a8 8 0 0 0 11.32-11.32l-48-48a8 8 0 0 0-11.32 0l-48 48a8 8 0 0 0 11.32 11.32"
      />
    </svg>
  );
};
