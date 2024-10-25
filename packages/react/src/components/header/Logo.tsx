import React from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import "./Logo.scss";
import { clsx } from "clsx";
export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  const qc = useQueryClient();
  const isLoading = useIsFetching(undefined, qc);
  return (
    <svg
      viewBox="-2 -2 28 30"
      className={clsx(isLoading && "l_loading", className)}
      {...props}
    >
      <defs>
        <linearGradient
          id="front-tri"
          x1="-4.4"
          y1="2.8"
          x2="19.5"
          y2="11.3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="color-mix(in lch, var(--primary-10), var(--primary-12) 30%)" />
          <stop offset="1" stopColor="var(--primary-10)" stopOpacity=".8" />
        </linearGradient>
        <linearGradient
          id="back-tri"
          x1=".2"
          y1="2.8"
          x2="19.3"
          y2="18.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="color-mix(in lch, var(--secondary-11), var(--secondary-8))" />
          <stop offset="1" stopColor="var(--secondary-10)" />
        </linearGradient>
      </defs>

      <g>
        <path
          id="tri1"
          d="M4.5 2a2 2 0 0 1 3-1.7L23 9.6a2 2 0 0 1 0 3.5L7.6 22.4a2 2 0 0 1-3-1.7V2Z"
          fill="url(#back-tri)"
        />
        <path
          id="tri2"
          d="M0 2A2 2 0 0 1 3 .3l15.5 9.3a2 2 0 0 1 0 3.5L3.1 22.4A2 2 0 0 1 0 20.7V2Z"
          fill="url(#front-tri)"
        />
      </g>
    </svg>
  );
}
