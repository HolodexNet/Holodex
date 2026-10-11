import type { ReactNode } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SelectOption<T extends string | number> {
  value: T
  label: string
  /** Optional richer rendering inside the list. */
  content?: ReactNode
}

interface SimpleSelectProps<T extends string | number> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  id?: string
  "aria-label"?: string
  size?: "sm" | "default"
  className?: string
}

/** A single-choice select over a flat list of options. */
export function SimpleSelect<T extends string | number>({
  value,
  onChange,
  options,
  id,
  size,
  className,
  ...props
}: SimpleSelectProps<T>) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next as T)
      }}
    >
      <SelectTrigger
        id={id}
        size={size}
        className={className}
        aria-label={props["aria-label"]}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.content ?? option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
