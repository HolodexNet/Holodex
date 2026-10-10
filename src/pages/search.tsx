import { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SearchIcon, FilterIcon, XIcon, ArrowRightIcon, MusicIcon, PlayIcon, GlobeIcon, UsersIcon, CalendarIcon, GridIcon, ListIcon } from '@/components/icons'
import { Avatar, Choice, EmptyState, ErrorState, GridSkeleton, IconButton, PageHeader, SectionHeading } from '@/components/shared'
import { VideoCard } from '@/components/video-card'
import { api } from '@/lib/api'
import { channelName, formatCount, topicName } from '@/lib/format'
import { usePreferences } from '@/lib/preferences'
import { useOrganizations } from '@/lib/queries'
import { cn } from '@/lib/utils'

const LANGUAGES = [{ value: 'all', label: 'Any language' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }, { value: 'id', label: 'Bahasa Indonesia' }, { value: 'es', label: 'Español' }, { value: 'ko', label: '한국어' }, { value: 'zh', label: '中文' }]
export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const { preferences, update } = usePreferences()
  const orgs = useOrganizations()
  const [draft, setDraft] = useState(params.get('q') || '')
  const [debounced, setDebounced] = useState(draft)
  const [focused, setFocused] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const term = params.get('q') || ''
  const type = ['stream', 'clip'].includes(params.get('type') || '') ? params.get('type')! : 'all'
  const lang = LANGUAGES.some((l) => l.value === params.get('lang')) ? params.get('lang')! : 'all'
  const org = params.get('org') || preferences.organization
  const sort = ['score', 'latest', 'oldest', 'longest', 'shortest', 'views'].includes(params.get('sort') || '') ? params.get('sort')! : 'score'
  const channel = params.get('channel')
  const topic = params.get('topic')
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const songs = ['none', 'one', 'many'].includes(params.get('songs') || '') ? params.get('songs')! : 'all'
  const hasSearch = !!(term || channel || topic || type !== 'all' || lang !== 'all' || params.get('org') || from || to || songs !== 'all')
  const invalidDates = !!(from && to && from > to)
  useEffect(() => { setDraft(term) }, [term])
  useEffect(() => { const timer = setTimeout(() => { setDebounced(draft.trim()); setActiveSuggestion(-1) }, 350); return () => clearTimeout(timer) }, [draft])
  const suggestionsQuery = useQuery({ queryKey: ['autocomplete', debounced], queryFn: ({ signal }) => api.autocomplete(debounced, signal), enabled: focused && debounced.length >= 2, staleTime: 30000 })
  const suggestions = useMemo(() => [
    ...(suggestionsQuery.data?.vtuber || []).map((c) => ({ key: `channel-${c.id}`, type: 'channel', value: c.id, label: channelName(c, preferences.englishNames), channel: c })),
    ...(suggestionsQuery.data?.topic || []).map((t) => ({ key: `topic-${t.id}`, type: 'topic', value: t.id, label: topicName(t.id), channel: undefined })),
  ], [suggestionsQuery.data, preferences.englishNames])
  const showSuggestions = focused && debounced === draft.trim() && suggestions.length > 0
  function change(key: string, value?: string) {
    setParams((current) => { const next = new URLSearchParams(current); if (!value || value === 'all') next.delete(key); else next.set(key, value); return next })
  }
  function choose(index: number) {
    const item = suggestions[index]
    if (!item) return
    setParams((current) => { const next = new URLSearchParams(current); next.delete('q'); if (item.type === 'channel') { next.set('channel', item.value); next.set('name', item.label); next.set('org', item.channel?.org || 'All Vtubers') } else next.set('topic', item.value); return next })
    setDraft(''); setFocused(false); input.current?.blur()
  }
  const query = useMemo(() => ({ search: term, ...(org !== 'All Vtubers' ? { org: [org] } : {}), ...(type !== 'all' ? { type: [type] } : {}), ...(lang !== 'all' ? { lang: [lang] } : {}), ...(channel ? { vtuber: [channel] } : {}), ...(topic ? { topic: [topic] } : {}), ...(from ? { from: `${from}T00:00:00Z` } : {}), ...(to ? { to: `${to}T23:59:59.999Z` } : {}), ...(songs !== 'all' ? { has_song: songs } : {}) }), [term, org, type, lang, channel, topic, from, to, songs])
  const results = useInfiniteQuery({ queryKey: ['search', query, sort], initialPageParam: undefined as unknown[] | undefined, enabled: hasSearch && !invalidDates,
    queryFn: ({ pageParam, signal }) => api.search(query, sort, pageParam, signal),
    getNextPageParam: (last, pages, cursor) => {
      if (!last.items.length || last.items.length < 24 || !last.cursor || (!last.approximate && pages.reduce((sum, p) => sum + p.items.length, 0) >= last.total)) return undefined
      const encoded = JSON.stringify(last.cursor)
      if (encoded === JSON.stringify(cursor) || pages.slice(0, -1).some((p) => JSON.stringify(p.cursor) === encoded)) return undefined
      return last.cursor
    }, staleTime: 60000,
  })
  const videos = [...new Map((results.data?.pages.flatMap((p) => p.items) || []).map((v) => [v.id, v])).values()]
  const orgOptions = [...new Set(['All Vtubers', org, ...(orgs.data || []).map((o) => o.name)])].map((name) => ({ value: name, label: name === 'All Vtubers' ? 'All organizations' : name }))
  const filterCount = [type !== 'all', lang !== 'all', channel, topic, from, to, songs !== 'all'].filter(Boolean).length
  return <>
    <PageHeader eyebrow="There’s a whole world out there" title="Find your next favorite." description="Search streams, discover talents, and get lost in the good stuff." />
    <form className="relative mt-8" role="search" onSubmit={(event) => { event.preventDefault(); if (showSuggestions && activeSuggestion >= 0) choose(activeSuggestion); else { change('q', draft.trim()); setFocused(false); input.current?.blur() } }}>
      <div className="search-box flex items-center gap-2 rounded-2xl border bg-card p-2 pl-5"><SearchIcon className="size-5 shrink-0 text-muted-foreground" /><Input ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} role="combobox" aria-label="Search Holodex" aria-expanded={!!showSuggestions} aria-controls={showSuggestions ? 'search-suggestions' : undefined} aria-autocomplete="list" aria-activedescendant={showSuggestions && activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined} placeholder="A channel, a game, a moment…" className="h-11 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0" onKeyDown={(e) => { if (e.key === 'Escape') setFocused(false); if (showSuggestions && ['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setActiveSuggestion((s) => e.key === 'ArrowDown' ? (s + 1) % suggestions.length : (s - 1 + suggestions.length) % suggestions.length) } }} />{draft && <IconButton label="Clear search text" size="icon-sm" onClick={() => { setDraft(''); input.current?.focus() }}><XIcon /></IconButton>}<Button type="submit" className="px-5">Search<ArrowRightIcon /></Button></div>
      {showSuggestions && <div id="search-suggestions" role="listbox" aria-label="Suggested channels and topics" className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-2xl border bg-popover p-2 shadow-2xl">{suggestions.map((suggestion, i) => <button type="button" key={suggestion.key} id={`suggestion-${i}`} role="option" aria-selected={activeSuggestion === i} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted', activeSuggestion === i && 'bg-muted')}>{suggestion.channel ? <Avatar channel={suggestion.channel} className="size-7" /> : <SearchIcon className="size-5 text-muted-foreground" />}<span className="flex-1">{suggestion.label}</span><Badge variant="secondary" className="text-[10px]">{suggestion.type}</Badge></button>)}</div>}
    </form>
    <div className="mt-5 flex flex-wrap items-center gap-2">{channel && <Badge variant="outline" className="gap-2 py-1.5"><UsersIcon className="size-3" />{params.get('name') || 'Selected channel'}<button aria-label="Remove channel filter" onClick={() => setParams((current) => { const next = new URLSearchParams(current); next.delete('channel'); next.delete('name'); return next })}><XIcon className="size-3" /></button></Badge>}{topic && <Badge variant="outline" className="gap-2 py-1.5">{topicName(topic)}<button aria-label="Remove topic filter" onClick={() => change('topic')}><XIcon className="size-3" /></button></Badge>}<span className="text-[11px] text-muted-foreground">{!channel && !topic && 'Tip: start typing a talent’s name to search their streams and mentions.'}</span></div>
    <div className="search-layout mt-8">
      <aside className={cn('search-filters', filtersOpen && 'search-filters-open')}>
        <div className="mb-6 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><FilterIcon className="size-4" />Filters</h2><div className="flex items-center gap-2"><button onClick={() => { setParams(term ? { q: term } : {}); setFiltersOpen(false) }} className="text-[10px] text-muted-foreground hover:text-foreground">Reset</button><IconButton label="Close filters" size="icon-xs" className="md:hidden" onClick={() => setFiltersOpen(false)}><XIcon /></IconButton></div></div>
        <div className="space-y-6"><FilterField label="Organization"><Choice label="Search organization" value={org} onChange={(v) => change('org', v)} options={orgOptions} className="w-full" /></FilterField>
          <FilterField label="Content type"><div className="flex flex-col gap-1">{[{ value: 'all', label: 'Everything' }, { value: 'stream', label: 'Streams' }, { value: 'clip', label: 'Clips & translations' }].map((option) => <button key={option.value} onClick={() => change('type', option.value)} aria-pressed={type === option.value} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted', type === option.value && 'bg-primary/8 font-medium text-primary-readable')}><span className={cn('flex size-3.5 items-center justify-center rounded-full border', type === option.value && 'border-primary')}><span className={cn('size-1.5 rounded-full', type === option.value && 'bg-primary')} /></span>{option.label}</button>)}</div></FilterField>
          <FilterField label="Language"><Choice label="Content language" value={lang} onChange={(v) => change('lang', v)} options={LANGUAGES} className="w-full" /></FilterField>
          <FilterField label="Music performances"><Choice label="Song count" value={songs} onChange={(v) => change('songs', v)} options={[{ value: 'all', label: 'Any video' }, { value: 'none', label: 'No songs' }, { value: 'one', label: 'One song' }, { value: 'many', label: 'Multiple songs' }]} className="w-full" /></FilterField>
          <Separator /><FilterField label="Date range"><div className="space-y-3"><label className="block text-[10px] text-muted-foreground">From<Input type="date" aria-label="Published from" value={from} onChange={(e) => change('from', e.target.value)} className="mt-1.5 w-full min-w-0 rounded-lg text-xs" /></label><label className="block text-[10px] text-muted-foreground">To<Input type="date" aria-label="Published until" min={from || undefined} value={to} onChange={(e) => change('to', e.target.value)} className="mt-1.5 w-full min-w-0 rounded-lg text-xs" /></label></div></FilterField>
        </div>
      </aside>
      <div className="min-w-0"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="search-filter-toggle text-xs" aria-expanded={filtersOpen}><FilterIcon />Filters{filterCount > 0 && <span className="rounded bg-muted px-1.5">{filterCount}</span>}</Button><p role="status" aria-live="polite" className="text-xs text-muted-foreground">{hasSearch && results.data ? <><strong className="font-medium text-foreground">{results.data.pages[0].approximate && 'About '}{formatCount(results.data.pages[0].total)}</strong> results{term && <> for “{term}”</>}</> : hasSearch && results.isFetching ? 'Finding your next favorite…' : 'Follow your curiosity'}</p></div><div className="flex items-center gap-2"><Choice label="Sort search results" value={sort} onChange={(v) => change('sort', v)} options={[{ value: 'score', label: 'Relevance' }, { value: 'latest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'longest', label: 'Longest' }, { value: 'shortest', label: 'Shortest' }, { value: 'views', label: 'Most viewed' }]} className="min-w-28 text-xs" /><IconButton label={preferences.view === 'grid' ? 'Switch to list view' : 'Switch to grid view'} size="icon-sm" onClick={() => update('view', preferences.view === 'grid' ? 'list' : 'grid')}>{preferences.view === 'grid' ? <ListIcon /> : <GridIcon />}</IconButton></div></div>
        {invalidDates ? <EmptyState icon={CalendarIcon} title="Those dates are out of order" description="The end date needs to be on or after the start date." /> : !hasSearch ? <SearchDiscovery onChoose={(topic) => change('topic', topic)} /> : results.isPending ? <GridSkeleton /> : results.error && !results.data ? <ErrorState error={results.error} retry={() => void results.refetch()} /> : videos.length ? <><div className={preferences.view === 'list' ? 'space-y-5' : 'video-grid'}>{videos.map((video) => <VideoCard key={video.id} video={video} list={preferences.view === 'list'} />)}</div>{results.hasNextPage && <div className="mt-8 text-center"><Button disabled={results.isFetchingNextPage} variant="outline" onClick={() => void results.fetchNextPage()}>{results.isFetchingNextPage ? 'Loading…' : 'Load more results'}<ArrowRightIcon /></Button></div>}{results.error && <div className="mt-5"><ErrorState error={results.error} retry={() => void (results.isFetchNextPageError ? results.fetchNextPage() : results.refetch())} /></div>}</> : <EmptyState title="No matches this time" description="Try a shorter phrase, a different organization, or fewer filters. Your next favorite might be one search away." action={<Button variant="outline" onClick={() => setParams(term ? { q: term, org: 'All Vtubers' } : {})}>Broaden your search</Button>} />}
      </div>
    </div>
  </>
}
function FilterField({ label, children }: { label: string; children: React.ReactNode }) { return <div><h3 className="mb-3 text-[11px] font-semibold">{label}</h3>{children}</div> }
function SearchDiscovery({ onChoose }: { onChoose: (topic: string) => void }) {
  return <div><div className="rounded-2xl border bg-card p-7"><p className="eyebrow">Take the scenic route</p><h2 className="mt-3 text-xl font-semibold tracking-tight">What are you in the mood for?</h2><p className="mt-2 text-xs leading-6 text-muted-foreground">From a late-night karaoke session to a stream you can’t stop thinking about.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{[{ title: 'Sing along', subtitle: 'Music, karaoke & performances', topic: 'singing', icon: MusicIcon }, { title: 'Hang out', subtitle: 'Talks, stories & everyday moments', topic: 'talk', icon: GlobeIcon }, { title: 'Celebrate something', subtitle: 'Birthday streams & milestones', topic: 'Birthday', icon: CalendarIcon }, { title: 'Go bigger', subtitle: '3D streams & unforgettable shows', topic: '3D_Stream', icon: PlayIcon }].map(({ title, subtitle, topic, icon: Icon }) => <button key={topic} onClick={() => onChoose(topic)} className="group flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary-readable"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{subtitle}</span></span><ArrowRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" /></button>)}</div></div><div className="mt-8"><SectionHeading>Explore a topic</SectionHeading><div className="flex flex-wrap gap-2">{['Minecraft', 'singing', 'talk', 'ASMR', 'Original_Song', 'Music_Cover', '3D_Stream', 'Birthday', 'Anniversary', 'watchalong'].map((topic) => <Button key={topic} variant="outline" size="sm" className="text-xs" onClick={() => onChoose(topic)}>{topicName(topic)}</Button>)}</div></div></div>
}
