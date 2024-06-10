import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export function AboutHeading(
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >,
) {
  return (
    <h3
      {...props}
      className={cn(
        "mb-2 mt-3 text-2xl tracking-tight md:text-3xl",
        props.className,
      )}
    />
  );
}
