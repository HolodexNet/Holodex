import * as React from "react";
import type { SVGProps } from "react";
export interface LogoTwitchIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}
/**
 * logo-twitch
 * IonIcons
 * @url https://icon-sets.iconify.design/ion
 * @license MIT
 */
export const LogoTwitchIcon = (props: LogoTwitchIconProps) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "1em"}
      height={props.size || "1em"}
      {...props}
    >
      <path
        fill="currentColor"
        d="m80 32l-32 80v304h96v64h64l64-64h80l112-112V32Zm336 256l-64 64h-96l-64 64v-64h-80V80h304Z"
      />
      <path fill="currentColor" d="M320 143h48v129h-48zm-112 0h48v129h-48z" />
    </svg>
  );
};
