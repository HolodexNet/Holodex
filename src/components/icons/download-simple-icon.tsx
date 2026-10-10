import * as React from "react";
import type { SVGProps } from "react";
export interface DownloadSimpleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * download-simple
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const DownloadSimpleIcon = (props: DownloadSimpleIconProps) => {
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
        d="M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0m-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 124.69V32a8 8 0 0 0-16 0v92.69L93.66 98.34a8 8 0 0 0-11.32 11.32Z"
      />
    </svg>
  );
};
