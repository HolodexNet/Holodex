import * as React from "react";
import type { SVGProps } from "react";
export interface ProhibitIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * prohibit
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ProhibitIcon = (props: ProhibitIconProps) => {
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
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m88 104a87.56 87.56 0 0 1-20.41 56.28L71.72 60.4A88 88 0 0 1 216 128m-176 0a87.56 87.56 0 0 1 20.41-56.28L184.28 195.6A88 88 0 0 1 40 128"
      />
    </svg>
  );
};
