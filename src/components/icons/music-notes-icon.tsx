import * as React from "react";
import type { SVGProps } from "react";
export interface MusicNotesIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * music-notes
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MusicNotesIcon = (props: MusicNotesIconProps) => {
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
        d="M212.92 17.69a8 8 0 0 0-6.86-1.45l-128 32A8 8 0 0 0 72 56v110.08A36 36 0 1 0 88 196v-85.75l112-28v51.83A36 36 0 1 0 216 164V24a8 8 0 0 0-3.08-6.31M52 216a20 20 0 1 1 20-20a20 20 0 0 1-20 20M88 93.75v-31.5l112-28v31.5ZM180 184a20 20 0 1 1 20-20a20 20 0 0 1-20 20"
      />
    </svg>
  );
};
