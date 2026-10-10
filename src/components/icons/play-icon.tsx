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
        d="M232.4 114.49L88.32 26.35a16 16 0 0 0-16.2-.3A15.86 15.86 0 0 0 64 39.87v176.26A15.94 15.94 0 0 0 80 232a16.07 16.07 0 0 0 8.36-2.35l144.04-88.14a15.81 15.81 0 0 0 0-27ZM80 215.94V40l143.83 88Z"
      />
    </svg>
  );
};
