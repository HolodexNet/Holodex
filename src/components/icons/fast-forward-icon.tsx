import * as React from "react";
import type { SVGProps } from "react";
export interface FastForwardIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * fast-forward
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const FastForwardIcon = (props: FastForwardIconProps) => {
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
        d="M248.67 114.66L160.48 58.5A15.91 15.91 0 0 0 136 71.84v37.3L56.48 58.5A15.91 15.91 0 0 0 32 71.84v112.32a15.92 15.92 0 0 0 24.48 13.34L136 146.86v37.3a15.92 15.92 0 0 0 24.48 13.34l88.19-56.16a15.8 15.8 0 0 0 0-26.68M48 183.94V72.07L135.82 128Zm104 0V72.07L239.82 128Z"
      />
    </svg>
  );
};
