import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/** Centered, width-capped column that standalone pages sit in. */
const pageShellVariants = cva("mx-auto flex w-full flex-col", {
  variants: {
    width: {
      md: "max-w-md",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "6xl": "max-w-6xl",
    },
    // "page" is the standard reading-page gutter; "none" leaves it to the caller.
    padding: {
      page: "px-4 pt-4 pb-16 md:px-8 md:pt-6",
      none: "",
    },
  },
  defaultVariants: { width: "4xl", padding: "page" },
})

function PageShell({
  className,
  width,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof pageShellVariants>) {
  return (
    <div
      className={cn(pageShellVariants({ width, padding }), className)}
      {...props}
    />
  )
}

export { PageShell, pageShellVariants }
