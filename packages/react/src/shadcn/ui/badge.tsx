import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default:
          "bg-primary-6 text-primary-12 shadow-sm hover:bg-primaryA-4 focus:ring-primary-8",
        primary:
          "bg-primary-6 text-primary-12 shadow-sm hover:bg-primaryA-4 focus:ring-primary-8",
        secondary:
          "bg-secondary-6 text-secondary-12 hover:bg-secondaryA-4 focus:ring-secondary-8",
        outline: "border text-base-12 focus:ring-base-8", // Assuming the foreground is a high-contrast text of base color
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

export { Badge, badgeVariants }
