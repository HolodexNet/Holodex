import * as React from "react";
import type { SVGProps } from "react";
export interface UploadSimpleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * upload-simple
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const UploadSimpleIcon = (props: UploadSimpleIconProps) => {
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
        d="M224 144v64a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8v-64a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0M93.66 77.66L120 51.31V144a8 8 0 0 0 16 0V51.31l26.34 26.35a8 8 0 0 0 11.32-11.32l-40-40a8 8 0 0 0-11.32 0l-40 40a8 8 0 0 0 11.32 11.32"
      />
    </svg>
  );
};
