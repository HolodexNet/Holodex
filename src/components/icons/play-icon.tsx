import * as React from "react";
import type { SVGProps } from "react";
export interface PlayIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * play
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const PlayIcon = (props: PlayIconProps) => {
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
        d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"
      />
    </svg>
  );
};
