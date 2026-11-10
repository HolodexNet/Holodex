import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * The bordered surface used for page sections and list items. Use
 * `cardVariants` on elements that already have the right tag (li, article).
 */
const cardVariants = cva("border bg-card", {
  variants: {
    radius: {
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-5 md:p-6",
    },
  },
  defaultVariants: { radius: "2xl", padding: "none" },
})

function Card({
  className,
  radius,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ radius, padding }), className)}
      {...props}
    />
  )
}

export { Card, cardVariants }
