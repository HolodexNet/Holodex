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
        "text-2xl font-bold tracking-wide mt-3 mb-2",
        props.className,
      )}
    />
  );
}
