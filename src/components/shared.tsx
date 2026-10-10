import { useState, type ComponentType, type SVGProps, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchIcon, RefreshIcon, WarningIcon, ArrowRightIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { ApiError, media } from '@/lib/api'
import type { Channel } from '@/lib/types'
import { channelName } from '@/lib/format'
import { usePreferences } from '@/lib/preferences'

export type IconType = ComponentType<SVGProps<SVGSVGElement>>
export function IconButton({ label, children, ...props }: React.ComponentProps<typeof Button> & { label: string }) {
  return <Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" aria-label={label} {...props} />}>{children}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}
export function Choice({ value, onChange, options, label, className, id }: {
  value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; label: string; className?: string; id?: string
}) {
  return <Select value={value} onValueChange={(v) => v !== null && onChange(v)} items={options}>
    <SelectTrigger id={id} aria-label={label} className={cn('min-w-32', className)}><SelectValue>{options.find((o) => o.value === value)?.label || value}</SelectValue></SelectTrigger>
    <SelectContent alignItemWithTrigger={false}>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
  </Select>
}
export function Avatar({ channel, className }: { channel: Channel; className?: string }) {
  const [failed, setFailed] = useState(false)
  const { preferences } = usePreferences()
  const name = channelName(channel, preferences.englishNames)
  return <span className={cn('inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground', className)}>
    {!failed && channel.id ? <img loading="lazy" src={channel.photo || media.avatar(channel.id)} alt="" className="size-full object-cover" onError={() => setFailed(true)} /> : name.slice(0, 2).toUpperCase()}
  </span>
}
export function EmptyState({ title, description, icon: Icon = SearchIcon, action }: { title: string; description: string; icon?: IconType; action?: ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center">
    <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted"><Icon className="size-6 text-muted-foreground" /></span>
    <h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}
  </div>
}
export function ErrorState({ error, retry }: { error: Error; retry: () => void }) {
  const apiError = error instanceof ApiError ? error : undefined
  const description = apiError?.status === 403 ? 'The API did not allow this request. Check your API origin or access key configuration.'
    : apiError?.status === 429 ? `The API needs a breather. Try again${apiError.retryAfter ? ` after ${apiError.retryAfter} seconds` : ' shortly'}.`
      : apiError?.status === 404 ? 'This item is no longer available in the catalog.' : error.message === 'Failed to fetch' ? 'We couldn’t reach Holodex. Check your connection and try again.' : error.message
  return <div role="alert"><EmptyState icon={WarningIcon} title="Something interrupted the connection" description={description} action={<Button variant="outline" onClick={retry}><RefreshIcon />Try again</Button>} /></div>
}
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-3">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div>
}
export function SectionHeading({ children, count, to, action }: { children: ReactNode; count?: number; to?: string; action?: ReactNode }) {
  return <div className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">{children}{count !== undefined && <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}</span>}</h2>{to ? <Link to={to} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">View all<ArrowRightIcon className="size-3.5" /></Link> : action}</div>
}
export function GridSkeleton() { return <div className="video-grid" aria-label="Loading videos" role="status">{Array.from({ length: 6 }, (_, i) => <div key={i}><Skeleton className="aspect-video w-full rounded-xl" /><div className="mt-4 flex gap-3"><Skeleton className="size-9 rounded-full" /><div className="flex-1"><Skeleton className="mb-2 h-4 w-full" /><Skeleton className="h-3 w-2/3" /></div></div></div>)}</div> }
