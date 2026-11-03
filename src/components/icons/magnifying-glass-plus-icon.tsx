import * as React from "react";
import type { SVGProps } from "react";
export interface MagnifyingGlassPlusIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * magnifying-glass-plus
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MagnifyingGlassPlusIcon = (
  props: MagnifyingGlassPlusIconProps
) => {
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
        d="M152 112a8 8 0 0 1-8 8h-24v24a8 8 0 0 1-16 0v-24H80a8 8 0 0 1 0-16h24V80a8 8 0 0 1 16 0v24h24a8 8 0 0 1 8 8m77.66 117.66a8 8 0 0 1-11.32 0l-50.06-50.07a88.11 88.11 0 1 1 11.31-11.31l50.07 50.06a8 8 0 0 1 0 11.32M112 184a72 72 0 1 0-72-72a72.08 72.08 0 0 0 72 72"
      />
    </svg>
  );
};
