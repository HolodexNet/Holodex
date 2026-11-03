import * as React from "react";
import type { SVGProps } from "react";
export interface SpeakerSlashIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * speaker-slash
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const SpeakerSlashIcon = (props: SpeakerSlashIconProps) => {
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
        d="M53.92 34.62a8 8 0 1 0-11.84 10.76L73.55 80H32a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h45.25l69.84 54.31A8 8 0 0 0 160 224v-48.91l42.08 46.29a8 8 0 1 0 11.84-10.76ZM32 96h40v64H32Zm112 111.64l-56-43.55v-68.2l56 61.6Zm42-63.77a24 24 0 0 0 0-31.72a8 8 0 1 1 12-10.57a40 40 0 0 1 0 52.88a8 8 0 0 1-12-10.59m-80.16-76a8 8 0 0 1 1.4-11.23l39.85-31A8 8 0 0 1 160 32v74.83a8 8 0 0 1-16 0V48.36l-26.94 21a8 8 0 0 1-11.22-1.45ZM248 128a79.9 79.9 0 0 1-20.37 53.34a8 8 0 0 1-11.92-10.67a64 64 0 0 0 0-85.33a8 8 0 1 1 11.92-10.67A79.83 79.83 0 0 1 248 128"
      />
    </svg>
  );
};
