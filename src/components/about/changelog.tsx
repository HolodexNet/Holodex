import { useQuery } from "@tanstack/react-query"

// Emitted as a static file and fetched on demand, so the markdown never
// rides along in a script bundle.
import changelogUrl from "../../../docs/CHANGELOG.md?url"
import { Skeleton } from "@/components/ui/skeleton"
import { useT } from "@/lib/i18n"
import { parseChangelog, tokenizeInline, type Release } from "@/lib/changelog"
import { ExternalLink, textLink } from "./shared"

const RELEASES_SHOWN = 3

async function fetchReleases(signal: AbortSignal): Promise<Release[]> {
  const res = await fetch(changelogUrl, { signal })
  if (!res.ok) throw new Error(`Changelog request failed: ${res.status}`)
  return parseChangelog(await res.text(), RELEASES_SHOWN)
}

/** Bold, italics, code, links and contributor @handles. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((token, i) => {
        switch (token.kind) {
          case "strong":
            return (
              <strong key={i} className="font-semibold text-foreground">
                {token.text}
              </strong>
            )
          case "em":
            return <em key={i}>{token.text}</em>
          case "code":
            return (
              <code
                key={i}
                className="rounded bg-muted px-1 font-mono text-[0.85em]"
              >
                {token.text}
              </code>
            )
          case "handle":
            return (
              <span key={i} className="font-semibold text-brand">
                {token.text}
              </span>
            )
          case "link":
            return token.href ? (
              <ExternalLink key={i} href={token.href} className={textLink}>
                {token.text}
              </ExternalLink>
            ) : (
              <span key={i}>{token.text}</span>
            )
          default:
            return <span key={i}>{token.text}</span>
        }
      })}
    </>
  )
}

/** The newest releases; nothing is requested until `enabled` turns true. */
export function Changelog({ enabled }: { enabled: boolean }) {
  const { t } = useT()
  const releases = useQuery({
    queryKey: ["changelog", changelogUrl],
    queryFn: ({ signal }) => fetchReleases(signal),
    enabled,
    // The file is fingerprinted per deploy; it cannot change under us.
    staleTime: Infinity,
  })

  if (releases.isError)
    return (
      <p className="text-sm text-muted-foreground">
        {t("about.changelog.unavailable")}{" "}
        <button
          type="button"
          onClick={() => void releases.refetch()}
          className={textLink}
        >
          {t("component.apiError.retry")}
        </button>
      </p>
    )
  if (!releases.data)
    return (
      <div aria-busy="true" className="space-y-6">
        {Array.from({ length: RELEASES_SHOWN }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
        ))}
      </div>
    )

  return (
    <ol className="relative space-y-6 border-l-2 border-dashed border-border pl-6">
      {releases.data.map((release, index) => (
        <li key={`${release.version}-${release.date}`} className="relative">
          <span
            aria-hidden="true"
            className={
              index === 0
                ? "absolute top-1.5 -left-7.75 size-3 rounded-full bg-primary ring-4 ring-primary/20"
                : "absolute top-1.5 -left-7.5 size-2.5 rounded-full bg-muted-foreground/50"
            }
          />
          <h3 className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm font-bold text-brand">
              v{release.version}
            </span>
            {release.name && (
              <span className="font-semibold">{release.name}</span>
            )}
            {release.date && (
              <span className="text-sm text-muted-foreground">
                {release.date}
              </span>
            )}
          </h3>
          <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {release.blocks.map((block, i) =>
              block.kind === "heading" ? (
                <p key={i} className="pt-1 font-semibold text-foreground">
                  <Inline text={block.text} />
                </p>
              ) : block.kind === "item" ? (
                <p
                  key={i}
                  className="relative pl-4 before:absolute before:left-0 before:text-brand before:content-['•']"
                  style={{ marginInlineStart: `${block.depth}rem` }}
                >
                  <Inline text={block.text} />
                </p>
              ) : (
                <p key={i}>
                  <Inline text={block.text} />
                </p>
              )
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
