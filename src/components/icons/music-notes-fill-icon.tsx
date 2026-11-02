import * as React from "react";
import type { SVGProps } from "react";
export interface MusicNotesFillIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * music-notes-fill
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MusicNotesFillIcon = (props: MusicNotesFillIconProps) => {
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
        d="M212.92 17.71a7.89 7.89 0 0 0-6.86-1.46l-128 32A8 8 0 0 0 72 56v110.1A36 36 0 1 0 88 196v-93.75l112-28v59.85a36 36 0 1 0 16 29.9V24a8 8 0 0 0-3.08-6.29"
      />
    </svg>
  );
};
