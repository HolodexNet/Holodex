import { cn } from "cn"

/** The Holodex mark: the primary colour behind its computed complement. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 49.531 46.719"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <g transform="translate(-71.24 -130.01)">
        <path
          className="fill-primary"
          d="m118.65 149.7a4.2333 4.2333 0 0 1 0 7.3324l-33.127 19.126a4.2333 4.2333 0 0 1-6.35-3.6662v-38.252a4.2333 4.2333 0 0 1 6.35-3.6662"
        />
        <path
          className="fill-complement"
          d="m110.72 149.68a4.2333 4.2333 0 0 1 0 7.3324l-33.127 19.126a4.2333 4.2333 0 0 1-6.35-3.6662v-38.252a4.2333 4.2333 0 0 1 6.35-3.6662"
        />
      </g>
    </svg>
  )
}
