import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-1 active:scale-[97%] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-base-3 text-base-12 hover:bg-base-4 focus-visible:ring-primary-7 active:bg-primaryA-7",
        outline:
          "border border-primary-7 bg-transparent hover:border-primaryA-8 hover:bg-primaryA-5 focus-visible:ring-primary-7",
        primary:
          "bg-primary-9 text-base-12 hover:bg-primaryA-4 focus-visible:ring-primary-7",
        secondary:
          "bg-secondary-9 text-base-12 hover:bg-secondaryA-4 focus-visible:ring-secondary-7",
        ghost:
          "hover:bg-base-4 hover:text-base-12 focus-visible:ring-primary-7 active:bg-primaryA-7",
        "ghost-yt":
          "hover:bg-base-4 hover:text-base-12 focus-visible:ring-red-7 active:bg-base-7",
        "ghost-secondary":
          "hover:bg-secondary-4 hover:text-base-12 focus-visible:ring-secondary-7 active:bg-secondaryA-7",
        link: "text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:ring-secondary-7",
        destructive:
          "bg-red-9 text-base-12 hover:bg-redA-10 focus-visible:ring-red-7 active:bg-redA-11",
      },
      size: {
        default: "h-8 gap-2 px-3.5 py-2", // also counts as "md"
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

export const WATCH_PAGE_DROPDOWN_BUTTON_STYLE =
  "flex w-full justify-start rounded-none px-4 py-2 transition-[padding] active:transform-none active:px-5"
