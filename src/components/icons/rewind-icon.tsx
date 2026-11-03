import * as React from "react";
import type { SVGProps } from "react";
export interface RewindIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * rewind
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const RewindIcon = (props: RewindIconProps) => {
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
        d="M223.77 58a16 16 0 0 0-16.25.53L128 109.14v-37.3a15.91 15.91 0 0 0-24.48-13.34l-88.19 56.16a15.8 15.8 0 0 0 0 26.68l88.19 56.16A15.91 15.91 0 0 0 128 184.16v-37.3l79.52 50.64A15.91 15.91 0 0 0 232 184.16V71.84A15.83 15.83 0 0 0 223.77 58M112 183.93L24.18 128L112 72.06Zm104 0L128.18 128L216 72.06Z"
      />
    </svg>
  );
};
