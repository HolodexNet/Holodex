import * as React from "react";
import type { SVGProps } from "react";
export interface CloseIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * close
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CloseIcon = (props: CloseIconProps) => {
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
        d="M205.66 194.34a8 8 0 0 1-11.32 11.32L128 139.31l-66.34 66.35a8 8 0 0 1-11.32-11.32L116.69 128L50.34 61.66a8 8 0 0 1 11.32-11.32L128 116.69l66.34-66.35a8 8 0 0 1 11.32 11.32L139.31 128Z"
      />
    </svg>
  );
};
