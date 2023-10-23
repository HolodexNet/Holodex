import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export function AboutDescription(
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >,
) {
  return (
    <p
      {...props}
      className={cn("mt-2 leading-8 tracking-wide", props.className)}
    />
  );
}
