import * as React from "react";
import type { SVGProps } from "react";
export interface CheckCircleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * check-circle
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const CheckCircleIcon = (props: CheckCircleIconProps) => {
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
        d="M173.66 98.34a8 8 0 0 1 0 11.32l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 0M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104m-16 0a88 88 0 1 0-88 88a88.1 88.1 0 0 0 88-88"
      />
    </svg>
  );
};
