import * as React from "react";
import type { SVGProps } from "react";
export interface ChatTextIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * chat-text
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const ChatTextIcon = (props: ChatTextIconProps) => {
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
        d="M216 48H40a16 16 0 0 0-16 16v160a15.85 15.85 0 0 0 9.24 14.5A16.1 16.1 0 0 0 40 240a15.9 15.9 0 0 0 10.25-3.78l.09-.07L83 208h133a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16m0 144H80a8 8 0 0 0-5.23 1.95L40 224V64h176ZM88 112a8 8 0 0 1 8-8h64a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m0 32a8 8 0 0 1 8-8h64a8 8 0 1 1 0 16H96a8 8 0 0 1-8-8"
      />
    </svg>
  );
};
