import type { ReactNode } from "react"
import { cn } from "cn"
import { MusicNotesFillIcon } from "@/components/icons"
import { Skeleton } from "@/components/ui/skeleton"

export const musicCollectionGridClass =
  "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-5 gap-y-7 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-6"

/** Size it with a text class; the note and the wordmark scale together. */
export function MusicdexLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-[750] tracking-tighter",
        className
      )}
    >
      <MusicNotesFillIcon className="size-4 text-brand" />
      <span>
        musicdex<span className="text-brand">.</span>
      </span>
    </span>
  )
}

export function MusicSectionHeading({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="music-section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  )
}

export function MusicLoading({ label = "Loading music" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-6 w-44" />
      <div className={musicCollectionGridClass}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
