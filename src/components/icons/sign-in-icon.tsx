import * as React from "react";
import type { SVGProps } from "react";
export interface SignInIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * sign-in
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const SignInIcon = (props: SignInIconProps) => {
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
        d="m141.66 133.66l-40 40a8 8 0 0 1-11.32-11.32L116.69 136H24a8 8 0 0 1 0-16h92.69L90.34 93.66a8 8 0 0 1 11.32-11.32l40 40a8 8 0 0 1 0 11.32M200 32h-64a8 8 0 0 0 0 16h56v160h-56a8 8 0 0 0 0 16h64a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8"
      />
    </svg>
  );
};
