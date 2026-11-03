import * as React from "react";
import type { SVGProps } from "react";
export interface PictureInPictureIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * picture-in-picture
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const PictureInPictureIcon = (props: PictureInPictureIconProps) => {
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
        d="M216 48H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16M40 64h176v56h-80a8 8 0 0 0-8 8v64H40Zm176 128h-72v-56h72z"
      />
    </svg>
  );
};
