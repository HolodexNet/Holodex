import * as React from "react";
import type { SVGProps } from "react";
export interface ListNumbersIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * list-numbers
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ListNumbersIcon = (props: ListNumbersIconProps) => {
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
        d="M224 128a8 8 0 0 1-8 8H104a8 8 0 0 1 0-16h112a8 8 0 0 1 8 8M104 72h112a8 8 0 0 0 0-16H104a8 8 0 0 0 0 16m112 112H104a8 8 0 0 0 0 16h112a8 8 0 0 0 0-16M43.58 55.16L48 52.94V104a8 8 0 0 0 16 0V40a8 8 0 0 0-11.58-7.16l-16 8a8 8 0 0 0 7.16 14.32m36.19 101.56a23.73 23.73 0 0 0-9.6-15.95a24.86 24.86 0 0 0-34.11 4.7a23.6 23.6 0 0 0-3.57 6.46a8 8 0 1 0 15 5.47a7.8 7.8 0 0 1 1.18-2.13a8.76 8.76 0 0 1 12-1.59a7.9 7.9 0 0 1 3.26 5.32a7.64 7.64 0 0 1-1.57 5.78a1 1 0 0 0-.08.11l-28.69 38.32A8 8 0 0 0 40 216h32a8 8 0 0 0 0-16H56l19.08-25.53a23.47 23.47 0 0 0 4.69-17.75"
      />
    </svg>
  );
};
