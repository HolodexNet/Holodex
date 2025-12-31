"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
  {
    variants: {
      color: {
        default: "",
        primary: "",
        secondary: "",
        destructive: "",
        accent: "",
      },
      size: {
        default: "",
        sm: "",
        lg: "",
      },
    },
    defaultVariants: {
      color: "default",
      size: "default",
    },
  }
)

const sliderTrackVariants = cva(
  "relative grow overflow-hidden rounded-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
  {
    variants: {
      color: {
        default: "bg-muted",
        primary: "bg-muted",
        secondary: "bg-muted",
        destructive: "bg-muted",
        accent: "bg-muted",
      },
      size: {
        default:
          "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
        sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
        lg: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
      },
    },
    defaultVariants: {
      color: "default",
      size: "default",
    },
  }
)

const sliderRangeVariants = cva(
  "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  {
    variants: {
      color: {
        default: "bg-primary",
        primary: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        accent: "bg-accent",
      },
    },
    defaultVariants: {
      color: "default",
    },
  }
)

const sliderThumbVariants = cva(
  "block shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      color: {
        default: "border-primary bg-background ring-ring/50",
        primary: "border-primary bg-background ring-ring/50",
        secondary: "border-secondary bg-background ring-secondary/50",
        destructive: "border-destructive bg-background ring-destructive/50",
        accent: "border-accent bg-background ring-accent/50",
      },
      size: {
        default: "size-4",
        sm: "size-3",
        lg: "size-5",
      },
    },
    defaultVariants: {
      color: "default",
      size: "default",
    },
  }
)

function Slider({
  className,
  color,
  size,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> &
  VariantProps<typeof sliderVariants>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(sliderVariants({ color, size, className }))}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(sliderTrackVariants({ color, size }))}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(sliderRangeVariants({ color }))}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={sliderThumbVariants({ color, size })}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider, sliderVariants }
