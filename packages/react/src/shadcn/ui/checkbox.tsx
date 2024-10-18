import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
// import { CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `peer h-4 w-4 shrink-0 rounded-sm border border-base-10 shadow 
      focus-visible:ring-primaryA-5 focus-visible:ring-offset-base-2 focus-visible:outline-none 
      disabled:cursor-not-allowed disabled:opacity-50 
      data-[state=checked]:bg-primary-9 data-[state=checked]:text-primary-12 data-[state=checked]:border-base-12 
      data-[state=checked]:ring-2`,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        "text-current dark:opacity-100 opacity-50 text-[11.5px] leading-[14px] text-white"
      )}
    >
      <div className="i-lsicon:check-correct-filled"></div>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
