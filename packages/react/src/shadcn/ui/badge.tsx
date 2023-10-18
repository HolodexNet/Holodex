import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  " inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-9 text-primary-12 shadow hover:bg-primaryA-4 focus:ring-primary-8",
        primary:
          "border-transparent bg-primary-9 text-primary-12 shadow hover:bg-primaryA-4 focus:ring-primary-8",
        secondary:
          "border-transparent bg-secondary-9 text-secondary-12 hover:bg-secondaryA-4 focus:ring-secondary-8",
        outline: "text-base-12 focus:ring-base-8", // Assuming the foreground is a high-contrast text of base color
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
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
