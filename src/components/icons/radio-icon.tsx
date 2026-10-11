import * as React from "react";
import type { SVGProps } from "react";
export interface RadioIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * radio
 * IonIcons
 * @url https://icon-sets.iconify.design/ion
 * @license MIT
 */
export const RadioIcon = (props: RadioIconProps) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "1em"}
      height={props.size || "1em"}
      {...props}
    >
      <circle cx={256} cy={256} r={36} fill="currentColor" />
      <path
        fill="currentColor"
        d="M190.24 341.77a22 22 0 0 1-16.46-7.38a118 118 0 0 1 0-156.76a22 22 0 1 1 32.87 29.24a74 74 0 0 0 0 98.29a22 22 0 0 1-16.43 36.61Zm131.52 0a22 22 0 0 1-16.43-36.61a74 74 0 0 0 0-98.29a22 22 0 1 1 32.87-29.24a118 118 0 0 1 0 156.76a22 22 0 0 1-16.44 7.38"
      />
      <path
        fill="currentColor"
        d="M139.29 392.72a21.92 21.92 0 0 1-16.08-7a190 190 0 0 1 0-259.49a22 22 0 1 1 32.13 30.06a146 146 0 0 0 0 199.38a22 22 0 0 1-16.06 37Zm233.42 0a22 22 0 0 1-16.06-37a146 146 0 0 0 0-199.38a22 22 0 1 1 32.13-30.06a190 190 0 0 1 0 259.49a21.92 21.92 0 0 1-16.07 6.95"
      />
      <path
        fill="currentColor"
        d="M429 438a22 22 0 0 1-16.39-36.67a218.34 218.34 0 0 0 0-290.66a22 22 0 0 1 32.78-29.34a262.34 262.34 0 0 1 0 349.34A22 22 0 0 1 429 438m-346 0a21.94 21.94 0 0 1-16.41-7.33a262.34 262.34 0 0 1 0-349.34a22 22 0 0 1 32.78 29.34a218.34 218.34 0 0 0 0 290.66A22 22 0 0 1 83 438"
      />
    </svg>
  );
};
