import * as React from "react";
import type { SVGProps } from "react";
export interface VideoCameraIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * video-camera
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const VideoCameraIcon = (props: VideoCameraIconProps) => {
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
        d="M251.77 73a8 8 0 0 0-8.21.39L208 97.05V72a16 16 0 0 0-16-16H32a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-25l35.56 23.71A8 8 0 0 0 248 184a8 8 0 0 0 8-8V80a8 8 0 0 0-4.23-7M192 184H32V72h160zm48-22.95l-32-21.33v-23.44L240 95Z"
      />
    </svg>
  );
};
