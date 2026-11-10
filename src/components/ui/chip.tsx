import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * A compact, rounded row holding an optional leading avatar, a label and
 * maybe an action. Interactive when rendered as a button; static as an `li`.
 * Use `Badge` instead for non-interactive status labels.
 */
const chipVariants = cva(
  "flex min-w-0 items-center gap-1.5 border focus-ring-sm transition-colors",
  {
    variants: {
      tone: {
        outline: "bg-background",
        card: "border-border bg-card hover:bg-muted",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        active: "border-primary bg-primary text-primary-foreground",
        muted: "border-transparent bg-muted",
        off: "border-dashed text-muted-foreground line-through decoration-muted-foreground/50 hover:bg-muted/50",
        danger: "border-destructive/40 bg-destructive/5",
      },
      size: {
        sm: "h-6 text-xs",
        md: "h-8 text-sm",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      // Leading avatar sits closer to the edge than a text label does.
      avatar: {
        true: "pl-1",
        false: "",
      },
    },
    compoundVariants: [
      { size: "sm", avatar: false, className: "px-2" },
      { size: "sm", avatar: true, className: "pr-2.5" },
      { size: "md", avatar: false, className: "px-3" },
      { size: "md", avatar: true, className: "pr-3" },
    ],
    defaultVariants: {
      tone: "outline",
      size: "md",
      shape: "pill",
      avatar: false,
    },
  }
)

function Chip({
  className,
  tone,
  size,
  shape,
  avatar,
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof chipVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(chipVariants({ tone, size, shape, avatar }), className),
      },
      props
    ),
    render,
    state: { slot: "chip", tone },
  })
}

export { Chip, chipVariants }
