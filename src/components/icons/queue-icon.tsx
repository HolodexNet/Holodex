import * as React from "react";
import type { SVGProps } from "react";
export interface QueueIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * queue
 * Phosphor
 * @url https://icon-sets.iconify.design/ph
 * @license MIT
 */
export const QueueIcon = (props: QueueIconProps) => {
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
        d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8m104 56H40a8 8 0 0 0 0 16h96a8 8 0 0 0 0-16m0 64H40a8 8 0 0 0 0 16h96a8 8 0 0 0 0-16m112-24a8 8 0 0 1-3.76 6.78l-64 40A8 8 0 0 1 168 200v-80a8 8 0 0 1 12.24-6.78l64 40A8 8 0 0 1 248 160m-23.09 0L184 134.43v51.14Z"
      />
    </svg>
  );
};
