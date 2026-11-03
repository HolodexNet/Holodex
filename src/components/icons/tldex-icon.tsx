import * as React from "react";
import type { SVGProps } from "react";
export interface TldexIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  /** Fill for the TL tab. */
  accent?: string;
}
/**
 * tldex
 * Custom, the TL and dex caption tabs
 */
export const TldexIcon = ({ accent = "#16B3A3", ...props }: TldexIconProps) => {
  return (
    <svg
      viewBox="24 22 226 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || "1em"}
      height={props.size || "1em"}
      {...props}
    >
      <rect
        x="28"
        y="26"
        width="110"
        height="90"
        rx="24"
        style={{ fill: accent }}
      />
      <text
        x="85"
        y="83"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={46}
        fontWeight={500}
        letterSpacing={4}
        fill="#FFFFFF"
      >
        TL
      </text>
      <rect x="62" y="97" width="42" height="8" rx="4" fill="#D8DFE8" />
      <rect
        x="110.5"
        y="56"
        width="132"
        height="108"
        rx="29"
        fill="#FCFCFD"
        stroke="#18284A"
        strokeWidth={4}
      />
      <text
        x="176.5"
        y="121"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize={50}
        fontWeight={600}
        letterSpacing={2}
        fill="#18284A"
      >
        dex
      </text>
      <rect x="148.5" y="139" width="60" height="9" rx="4.5" fill="#9AA7BF" />
    </svg>
  );
};
