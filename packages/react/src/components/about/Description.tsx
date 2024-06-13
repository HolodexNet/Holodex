import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export function AboutDescription(
  props: DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >,
) {
  return (
    <p {...props} className={cn("mt-2 indent-4 leading-8", props.className)} />
  );
}
