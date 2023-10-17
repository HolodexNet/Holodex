import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-9 text-base-12 hover:bg-primaryA-4 focus-visible:ring-primary-7",
        outline:
          "border border-primary-7 bg-transparent hover:border-primaryA-8 hover:bg-primaryA-4 focus-visible:ring-primary-7",
        secondary:
          "bg-secondary-9 text-base-12 hover:bg-secondaryA-4 focus-visible:ring-secondary-7 ",
        ghost: "hover:bg-primary-4 hover:text-base-12 focus-visible:ring-primary-7",
        link: "text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-secondary-7",
      },
      size: {
        default: "h-8 gap-2 px-3.5 py-2",
        sm: "h-6 gap-1.5 rounded-md px-1 text-xs",
        lg: "h-10 gap-3 rounded-md px-6 text-lg ",
        icon: "h-8 w-8",
        "icon-lg": "h-10 w-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
