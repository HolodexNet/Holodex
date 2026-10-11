import * as React from "react";
import type { SVGProps } from "react";
export interface PlaylistIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * playlist
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const PlaylistIcon = (props: PlaylistIconProps) => {
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
        d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m8 72h120a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16m72 48H40a8 8 0 0 0 0 16h72a8 8 0 0 0 0-16m135.66-57.7a8 8 0 0 1-10 5.36L208 122.75V192a32.05 32.05 0 1 1-16-27.69V112a8 8 0 0 1 10.3-7.66l40 12a8 8 0 0 1 5.36 9.96M192 192a16 16 0 1 0-16 16a16 16 0 0 0 16-16"
      />
    </svg>
  );
};
