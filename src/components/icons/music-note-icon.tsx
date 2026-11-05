import * as React from "react";
import type { SVGProps } from "react";
export interface MusicNoteIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * music-note
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const MusicNoteIcon = (props: MusicNoteIconProps) => {
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
        d="m210.3 56.34l-80-24A8 8 0 0 0 120 40v108.26A48 48 0 1 0 136 184V98.75l69.7 20.91A8 8 0 0 0 216 112V64a8 8 0 0 0-5.7-7.66M88 216a32 32 0 1 1 32-32a32 32 0 0 1-32 32m112-114.75l-64-19.2v-31.3L200 70Z"
      />
    </svg>
  );
};
