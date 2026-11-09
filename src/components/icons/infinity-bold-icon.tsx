import * as React from "react";
import type { SVGProps } from "react";
export interface InfinityBoldIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * infinity-bold
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const InfinityBoldIcon = (props: InfinityBoldIconProps) => {
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
        d="M252 128a60 60 0 0 1-102.43 42.43l-.49-.53l-59.86-67.59a36 36 0 1 0 0 51.38l3.08-3.48a12 12 0 1 1 18 15.91l-3.35 3.78l-.49.53a60 60 0 1 1 0-84.86l.49.53l59.86 67.59a36 36 0 1 0 0-51.38l-3.08 3.48a12 12 0 1 1-18-15.91l3.35-3.78l.49-.53A60 60 0 0 1 252 128"
      />
    </svg>
  );
};
