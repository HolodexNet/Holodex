import * as React from "react";
import type { SVGProps } from "react";
export interface FloppyDiskIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * floppy-disk
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const FloppyDiskIcon = (props: FloppyDiskIconProps) => {
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
        d="M219.31 72L184 36.69A15.86 15.86 0 0 0 172.69 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V83.31A15.86 15.86 0 0 0 219.31 72M168 208H88v-56h80Zm40 0h-24v-56a16 16 0 0 0-16-16H88a16 16 0 0 0-16 16v56H48V48h124.69L208 83.31ZM160 72a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h56a8 8 0 0 1 8 8"
      />
    </svg>
  );
};
