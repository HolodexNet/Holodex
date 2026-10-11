import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useT } from "@/lib/i18n"

interface LoadMoreProps {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  /** Load automatically when scrolled near; otherwise wait for a click. */
  auto: boolean
}

/**
 * End-of-list control. In scroll mode it watches itself approaching the
 * viewport and loads ahead of the reader; the button stays as a fallback and
 * as the manual control when scroll mode is off.
 */
export function LoadMore({ hasMore, loading, onLoadMore, auto }: LoadMoreProps) {
  const { t } = useT()
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onLoadMore)

  useEffect(() => {
    callback.current = onLoadMore
  })

  useEffect(() => {
    const el = ref.current
    if (!el || !auto || !hasMore || loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callback.current()
      },
      { rootMargin: "600px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [auto, hasMore, loading])

  if (!hasMore) return null

  return (
    <div ref={ref} className="flex min-h-16 items-center justify-center py-6">
      {loading ? (
        <Spinner className="size-5 text-muted-foreground" />
      ) : (
        <Button variant="outline" onClick={onLoadMore}>
          {t("component.loadMore")}
        </Button>
      )}
    </div>
  )
}
