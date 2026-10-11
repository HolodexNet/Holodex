import * as React from "react";
import type { SVGProps } from "react";
export interface MultiviewIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * multiview
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MultiviewIcon = (props: MultiviewIconProps) => {
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
        d="M208 40H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h160a24 24 0 0 0 24-24V64a24 24 0 0 0-24-24m8 136a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8Zm-48 48a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8m-3.56-110.66l-48-32A8 8 0 0 0 104 88v64a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32M120 137.05V103l25.58 17Z"
      />
    </svg>
  );
};
