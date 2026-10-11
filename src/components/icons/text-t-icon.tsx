import * as React from "react";
import type { SVGProps } from "react";
export interface TextTIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * text-t
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const TextTIcon = (props: TextTIconProps) => {
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
        d="M208 56v32a8 8 0 0 1-16 0V64h-56v128h24a8 8 0 0 1 0 16H96a8 8 0 0 1 0-16h24V64H64v24a8 8 0 0 1-16 0V56a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
