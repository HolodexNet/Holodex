import * as React from "react";
import type { SVGProps } from "react";
export interface HandTapIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * hand-tap
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const HandTapIcon = (props: HandTapIconProps) => {
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
        d="M56 76a60 60 0 0 1 120 0a8 8 0 0 1-16 0a44 44 0 0 0-88 0a8 8 0 1 1-16 0m140 44a27.9 27.9 0 0 0-13.36 3.39A28 28 0 0 0 144 106.7V76a28 28 0 0 0-56 0v80l-3.82-6.13a28 28 0 0 0-48.41 28.17l29.32 50a8 8 0 1 0 13.8-8.04L49.6 170a12 12 0 1 1 20.78-12l.14.23l18.68 30A8 8 0 0 0 104 184V76a12 12 0 0 1 24 0v68a8 8 0 1 0 16 0v-12a12 12 0 0 1 24 0v20a8 8 0 0 0 16 0v-4a12 12 0 0 1 24 0v36c0 21.61-7.1 36.3-7.16 36.42a8 8 0 0 0 3.58 10.73a7.9 7.9 0 0 0 3.58.85a8 8 0 0 0 7.16-4.42c.37-.73 8.85-18 8.85-43.58v-36A28 28 0 0 0 196 120"
      />
    </svg>
  );
};
