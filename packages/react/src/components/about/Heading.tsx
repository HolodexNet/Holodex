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
        "mb-2 mt-6 text-2xl tracking-tight first:mt-2 md:text-3xl",
        props.className,
      )}
    />
  );
}
