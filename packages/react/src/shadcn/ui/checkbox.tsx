import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
// import { CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      `peer h-4 w-4 shrink-0 rounded-sm border border-primary-6 ring-primaryA-2 ring-2 ring-offset-2 ring-offset-base-2 shadow focus-visible:ring-primaryA-5 focus-visible:ring-offset-base-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-9 data-[state=checked]:text-primary-12`,
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <div className="i-mingcute:check-2-fill text-sm"></div>
      {/* <CheckIcon className="h-4 w-4" /> */}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
