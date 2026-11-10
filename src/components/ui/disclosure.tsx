import { CaretDownIcon } from "@/components/icons"
import { cn } from "cn"

/**
 * Parts for native `<details>` disclosures. The summary drops the browser's
 * marker and gets a focus ring; the chevron flips when its details is open.
 * Callers set padding, radius and alignment.
 */
function DisclosureSummary({
  className,
  ...props
}: React.ComponentProps<"summary">) {
  return (
    <summary
      data-slot="disclosure-summary"
      className={cn(
        "flex cursor-pointer list-none gap-3 font-semibold focus-ring select-none [&::-webkit-details-marker]:hidden",
        className
      )}
      {...props}
    />
  )
}

function DisclosureChevron({
  className,
  ...props
}: React.ComponentProps<typeof CaretDownIcon>) {
  return (
    <CaretDownIcon
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none [[open]>summary>&]:rotate-180",
        className
      )}
      {...props}
    />
  )
}

export { DisclosureSummary, DisclosureChevron }
