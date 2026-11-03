import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"

import type { StageSize } from "@/lib/multiview/flip"

const SizeContext = createContext<StageSize>({ width: 0, height: 0 })
const SizeRefContext = createContext<RefObject<StageSize>>({
  current: { width: 0, height: 0 },
})

/** The stage's size in pixels; everything inside is sized as a share of it. */
export const useStageSize = () => useContext(SizeContext)
/** The same, without rendering again whenever the window is resized. */
export const useStageSizeRef = () => useContext(SizeRefContext)

export function StageSizeProvider({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const element = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<StageSize>({ width: 0, height: 0 })
  const sizeRef = useRef(size)

  useLayoutEffect(() => {
    const node = element.current
    if (!node) return
    const measure = () => {
      const next = { width: node.clientWidth, height: node.clientHeight }
      sizeRef.current = next
      setSize((current) =>
        current.width === next.width && current.height === next.height
          ? current
          : next
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={element} className={className}>
      <SizeRefContext.Provider value={sizeRef}>
        <SizeContext.Provider value={size}>{children}</SizeContext.Provider>
      </SizeRefContext.Provider>
    </div>
  )
}
