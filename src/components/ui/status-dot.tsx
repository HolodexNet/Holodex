import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/** A small colored dot for connection/delivery state. Decorative: pair it with text. */
const statusDotVariants = cva("shrink-0 rounded-full", {
  variants: {
    tone: {
      ok: "bg-emerald-500",
      warn: "animate-pulse bg-amber-500",
      error: "bg-destructive",
      idle: "bg-muted-foreground/40",
    },
    size: {
      sm: "size-1.5",
      md: "size-2",
    },
  },
  defaultVariants: { tone: "idle", size: "sm" },
})

function StatusDot({
  className,
  tone,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusDotVariants>) {
  return (
    <span
      aria-hidden="true"
      data-slot="status-dot"
      className={cn(statusDotVariants({ tone, size }), className)}
      {...props}
    />
  )
}

export { StatusDot, statusDotVariants }
