import * as React from "react";
import type { SVGProps } from "react";
export interface SkipForwardIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * skip-forward
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const SkipForwardIcon = (props: SkipForwardIconProps) => {
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
        d="M200 32a8 8 0 0 0-8 8v69.23L72.43 34.45A15.95 15.95 0 0 0 48 47.88v160.24a16 16 0 0 0 24.43 13.43L192 146.77V216a8 8 0 0 0 16 0V40a8 8 0 0 0-8-8M64 207.93V48.05l127.84 80Z"
      />
    </svg>
  );
};
