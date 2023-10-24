import React from "react";
import { cn } from "@/lib/utils";

export interface H3Props extends React.ComponentPropsWithRef<"h3"> {}

const TypographyH3 = React.forwardRef<HTMLHeadingElement, H3Props>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "scroll-m-20 text-2xl font-semibold tracking-tight",
          className,
        )}
        {...props}
      />
    );
  },
);

export interface H4Props extends React.ComponentPropsWithRef<"h4"> {}

const TypographyH4 = React.forwardRef<HTMLHeadingElement, H4Props>(
  ({ className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn(
          "scroll-m-20 text-xl font-semibold tracking-tight",
          className,
        )}
        {...props}
      />
    );
  },
);

export interface LargeProps extends React.ComponentPropsWithRef<"div"> {}

const TypographyLarge = React.forwardRef<HTMLDivElement, LargeProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    );
  },
);

export interface ParagraphProps extends React.ComponentPropsWithRef<"p"> {}

const TypographyP = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
        {...props}
      />
    );
  },
);

export { TypographyH3, TypographyH4, TypographyLarge, TypographyP };
