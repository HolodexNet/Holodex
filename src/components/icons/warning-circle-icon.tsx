import * as React from "react";
import type { SVGProps } from "react";
export interface WarningCircleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * warning-circle
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const WarningCircleIcon = (props: WarningCircleIconProps) => {
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
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m-8-80V80a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0m20 36a12 12 0 1 1-12-12a12 12 0 0 1 12 12"
      />
    </svg>
  );
};
