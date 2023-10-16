import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes } from "react";

interface LoadingProps {
  size: "sm" | "md" | "lg" | "xl";
}

export function Loading(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
    LoadingProps,
) {
  const sizeCN = cn({
    "text-sm": props.size === "sm",
    "text-lg": props.size === "md",
    "text-2xl": props.size === "lg",
    "text-4xl": props.size === "xl",
  });

  return (
    <div
      {...props}
      className={cn(
        "flex w-full h-full justify-center items-center",
        props.className,
      )}
    >
      <div className={cn("i-lucide:loader-2 animate-spin", sizeCN)} />
    </div>
  );
}

export function GlobalLoading () {

	return (
		<div className="fixed top-0 left-0 w-full h-full">
			<Loading size='xl' />
		</div>
	)
}