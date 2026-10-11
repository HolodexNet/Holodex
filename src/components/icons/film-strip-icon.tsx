import * as React from "react";
import type { SVGProps } from "react";
export interface FilmStripIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * film-strip
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const FilmStripIcon = (props: FilmStripIconProps) => {
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
        d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 88h80v80H40Zm96-16V56h32v16Zm-16 0H88V56h32Zm0 112v16H88v-16Zm16 0h32v16h-32Zm0-16V88h80v80Zm80-96h-32V56h32ZM72 56v16H40V56ZM40 184h32v16H40Zm176 16h-32v-16h32z"
      />
    </svg>
  );
};
