import * as React from "react";
import type { SVGProps } from "react";
export interface CornersInIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * corners-in
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CornersInIcon = (props: CornersInIconProps) => {
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
        d="M152 96V48a8 8 0 0 1 16 0v40h40a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8m-56 56H48a8 8 0 0 0 0 16h40v40a8 8 0 0 0 16 0v-48a8 8 0 0 0-8-8m112 0h-48a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-40h40a8 8 0 0 0 0-16M96 40a8 8 0 0 0-8 8v40H48a8 8 0 0 0 0 16h48a8 8 0 0 0 8-8V48a8 8 0 0 0-8-8"
      />
    </svg>
  );
};
