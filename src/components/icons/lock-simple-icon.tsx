import * as React from "react";
import type { SVGProps } from "react";
export interface LockSimpleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * lock-simple
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const LockSimpleIcon = (props: LockSimpleIconProps) => {
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
        d="M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16M96 56a32 32 0 0 1 64 0v24H96Zm112 152H48V96h160z"
      />
    </svg>
  );
};
