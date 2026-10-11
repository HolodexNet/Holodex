import * as React from "react";
import type { SVGProps } from "react";
export interface SidebarSimpleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * sidebar-simple
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const SidebarSimpleIcon = (props: SidebarSimpleIconProps) => {
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
        d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 56h40v144H40Zm176 144H96V56h120z"
      />
    </svg>
  );
};
