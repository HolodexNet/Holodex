import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * An inline notice: optional leading icon (a direct `svg` child) plus content.
 * Unlike `Alert`-style toasts it is part of the page flow.
 */
const calloutVariants = cva(
  "flex items-start gap-3 rounded-xl border p-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        muted: "bg-muted/50 [&>svg]:text-muted-foreground",
        warning:
          "border-amber-500/30 bg-amber-500/10 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { tone: "muted" },
  }
)

function Callout({
  className,
  tone,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof calloutVariants>) {
  return (
    <div
      data-slot="callout"
      className={cn(calloutVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Callout, calloutVariants }
