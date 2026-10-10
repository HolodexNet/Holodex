import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GridIcon, PlusIcon, XIcon, ArrowRightIcon } from '@/components/icons'
import { EmptyState, IconButton, PageHeader } from '@/components/shared'

export function parseVideoId(value: string): string | undefined {
  if (/^[\w-]{11}$/.test(value.trim())) return value.trim()
  try { const url = new URL(value); const host = url.hostname.replace(/^www\./, ''); const id = host === 'youtu.be' ? url.pathname.slice(1).split('/')[0] : ['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host) ? url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|live|shorts)\/([\w-]{11})/)?.[1] : undefined; if (id && /^[\w-]{11}$/.test(id)) return id } catch { /* User input may be a bare ID. */ }
}
export function MultiviewPage() {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const ids = [...new Set((params.get('videos') || '').split(',').filter((id) => /^[\w-]{11}$/.test(id)))].slice(0, 4)
  function add() { const id = parseVideoId(draft); if (!id) { setError('Paste a YouTube video URL or an 11-character video ID.'); return }; if (ids.includes(id)) { setError('That stream is already here.'); return }; setParams({ videos: [...ids, id].slice(0, 4).join(',') }); setDraft(''); setError('') }
  return <><PageHeader eyebrow="A few favorites, together" title="More moments. One screen." description="Build your own view with up to four YouTube streams. Press play in each player when you’re ready." /><form onSubmit={(event) => { event.preventDefault(); add() }} className="mt-8 flex max-w-2xl gap-3"><Input aria-label="YouTube video URL or ID" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Paste a YouTube URL or video ID" className="rounded-xl" disabled={ids.length >= 4} /><Button type="submit" disabled={ids.length >= 4}><PlusIcon />Add stream</Button></form>{error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}{ids.length ? <div className={`multiview-grid mt-8 ${ids.length === 1 ? 'multiview-single' : ''}`}>{ids.map((id, index) => <section key={id} className="overflow-hidden rounded-2xl border bg-card"><div className="flex items-center justify-between px-4 py-2"><Link to={`/watch/${id}`} className="text-xs text-muted-foreground hover:text-primary-readable">Stream {index + 1} · {id}</Link><IconButton label={`Remove stream ${index + 1}`} size="icon-xs" onClick={() => setParams({ videos: ids.filter((video) => video !== id).join(',') })}><XIcon /></IconButton></div><iframe title={`Multiview stream ${index + 1}`} src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="aspect-video w-full border-0" /></section>)}</div> : <div className="mt-8"><EmptyState icon={GridIcon} title="Bring a few worlds together" description="Add a stream above, or use the multiview button beside any live stream on the home page." action={<Button render={<Link to="/" />}>Choose live streams<ArrowRightIcon /></Button>} /></div>}</>
}
