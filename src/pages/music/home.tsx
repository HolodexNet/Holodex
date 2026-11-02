import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  DiscoverySections,
  PlaylistCards,
} from "@/components/music/discovery/sections"
import { Button } from "@/components/ui/button"
import { SongList, SongListSkeleton } from "@/components/music/song-list"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AddToQueueButton,
  MusicHero,
  PlaySongsButton,
} from "@/components/music/hero"
import {
  MusicNavigation,
  MusicSectionHeading,
  MusicLoading,
} from "@/components/music/page-header"
import { MusicArtwork } from "@/components/music/artwork"
import { MusicLikedSkeleton } from "@/components/music/skeletons"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { musicApi } from "@/lib/musicdex/api"
import { musicHomeQueryOptions } from "@/lib/musicdex/queries"
import { useFavorites, useOrgs } from "@/lib/queries"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

/** The old standalone /music/favorites address. */
export function MusicFavorites() {
  return <Navigate to="/favorites#music" replace />
}

/** The old standalone /music/org/:org address: pick that org, land on the home tab. */
export default function MusicOrgRedirect() {
  const { org: routeOrg } = useParams()
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const orgs = useOrgs()
  const match = orgs.data?.find((item) => item.name === routeOrg)
  useEffect(() => {
    if (match) setCurrentOrg(match)
  }, [match, setCurrentOrg])
  if (orgs.isPending) return <MusicLoading label="Loading music" />
  return <Navigate to="/#music" replace />
}

/** The Musicdex discovery page, shown as a tab of the main home page. */
export function MusicHomeTab() {
  const org = useOrgStore((s) => s.currentOrg.name)
  const blocked = useSettings((s) => s.blockedChannels)
  const queries = musicHomeQueryOptions(org)
  const discovery = useQuery(queries.discovery)
  const trending = useQuery(queries.trending)
  const songs =
    trending.data?.filter(
      (song) => !blocked.some((channel) => channel.id === song.channel_id)
    ) ?? []
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      <MusicHero
        scope={org}
        playlists={discovery.data?.recommended?.playlists ?? []}
        loading={discovery.isPending}
      />
      {discovery.isError && !discovery.data ? (
        <ErrorMessage
          error={discovery.error}
          onRetry={() => void discovery.refetch()}
        />
      ) : (
        <DiscoverySections
          discovery={discovery.data}
          scope={{ type: "org", name: org }}
          browse
          loading={discovery.isPending}
        />
      )}
      <section className="rounded-[16px] border border-border bg-[color-mix(in_oklch,var(--card)_70%,transparent)] p-6 max-md:px-2.5 max-md:py-[18px] [&_.music-section-heading]:mb-[18px] max-md:[&_.music-section-heading]:px-1.5 max-md:[&_.music-section-heading_button]:text-[11px]">
        <MusicSectionHeading
          title="Popular songs"
          description="Trending songs according to listeners on musicdex."
        >
          {trending.isPending ? (
            <Skeleton className="h-8 w-24" aria-hidden="true" />
          ) : songs.length ? (
            <div className="flex items-center gap-2">
              <PlaySongsButton
                songs={songs}
                source={{
                  id: `trending:${org}`,
                  title: `Trending ${org} songs`,
                }}
              />
              <AddToQueueButton songs={songs} />
            </div>
          ) : null}
        </MusicSectionHeading>
        {trending.isPending ? (
          <SongListSkeleton />
        ) : trending.isError && !trending.data ? (
          <ErrorMessage
            error={trending.error}
            onRetry={() => void trending.refetch()}
          />
        ) : songs.length ? (
          <SongList
            songs={songs}
            source={{ id: `trending:${org}`, title: `Trending ${org} songs` }}
            preview={20}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No trending songs found.
          </p>
        )}
      </section>
    </div>
  )
}

/** Musicdex for favorited channels, shown as a tab of the favorites page. */
export function MusicFavoritesTab() {
  const userId = useAuth((s) => s.user?.id ?? null)
  const favorites = useFavorites()
  const blocked = useSettings((s) => s.blockedChannels)
  const [visibleCount, setVisibleCount] = useState(10)
  const eligibleChannels = favorites.favorites.filter(
    (channel) => !blocked.some((item) => item.id === channel.id)
  )
  const favoriteChannels = eligibleChannels.slice(0, visibleCount)
  const discovery = useQueries({
    queries: favoriteChannels.map((channel) => ({
      queryKey: ["musicdex", "discovery", "channel", channel.id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        musicApi.discoveryChannel(channel.id, signal),
      staleTime: 5 * 60_000,
    })),
  })
  const sections = discovery.flatMap((item) => (item.data ? [item.data] : []))
  const playlists = [
    ...new Map(
      sections
        .flatMap((item) => item.recommended?.playlists ?? [])
        .map((playlist) => [playlist.id, playlist])
    ).values(),
  ]
  const streams = [
    ...new Map(
      sections
        .flatMap((item) => item.recentSingingStreams ?? [])
        .map((stream) => [stream.video.id, stream])
    ).values(),
  ]
  const liked = useQuery({
    queryKey: ["musicdex", "liked", userId, 1],
    queryFn: ({ signal }) => musicApi.likedSongs(1, signal),
    enabled: !!userId,
  })
  if (!userId)
    return (
      <div className="space-y-9 max-md:space-y-7">
        <div className="relative flex min-h-72.5 items-center justify-between gap-9 overflow-hidden rounded-2xl border border-border bg-[color-mix(in_oklch,var(--complement-soft)_13%,var(--card))] p-[clamp(24px,4vw,48px)] max-md:min-h-70 max-md:p-6.5">
          <div className="max-md:relative max-md:z-1">
            <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.2] font-bold tracking-tighter">
              Make yourself at home.
            </h2>
            <p className="mt-3 mb-6 max-w-97.5 text-[13px] leading-[1.8] text-muted-foreground">
              Sign in with your Holodex account to bring your favorite channels
              into the listening room.
            </p>
            <Button nativeButton={false} render={<Link to="/login" />}>
              Sign in to Holodex
            </Button>
          </div>
          <div className="mr-6 w-[220px] shrink-0 rotate-[9deg] max-md:pointer-events-none max-md:absolute max-md:-right-[115px] max-md:-bottom-[30px] max-md:w-[250px] max-md:opacity-15">
            <MusicArtwork title="Your favorites" seed="favorites" radio />
          </div>
        </div>
      </div>
    )
  return (
    <div className="space-y-9 max-md:space-y-7">
      <MusicHero
        scope="Favorites"
        playlists={playlists}
        favorites
        songs={(liked.data?.content ?? []).filter(
          (song) => !blocked.some((channel) => channel.id === song.channel_id)
        )}
      />
      {favorites.isPending ? (
        <p className="text-sm text-muted-foreground">
          Loading favorite channels…
        </p>
      ) : favorites.isError ? (
        <ErrorMessage
          error={favorites.error}
          onRetry={() => void favorites.refetch()}
        />
      ) : favoriteChannels.length ? (
        <>
          <DiscoverySections
            discovery={{
              version: 1,
              recommended: { playlists },
              recentSingingStreams: streams,
            }}
            scope={{ type: "favorites" }}
          />
          {discovery.some((item) => item.isPending) && (
            <p className="text-sm text-muted-foreground">
              Loading music from favorite channels…
            </p>
          )}
          {discovery.some((item) => item.isError) && (
            <ErrorMessage
              error={discovery.find((item) => item.isError)?.error}
              onRetry={() => {
                discovery.forEach((item) => {
                  if (item.isError) void item.refetch()
                })
              }}
            />
          )}
          {favoriteChannels.length < eligibleChannels.length && (
            <Button
              variant="outline"
              disabled={discovery.some((item) => item.isPending)}
              onClick={() => setVisibleCount((count) => count + 10)}
            >
              Load more favorite channels
            </Button>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Favorite channels to discover their music here.
        </p>
      )}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Liked songs</h2>
          <Link
            to="/music/liked"
            className="text-sm text-primary hover:underline"
          >
            See all
          </Link>
        </div>
        {liked.isPending ? (
          <p className="text-sm text-muted-foreground">Loading liked songs…</p>
        ) : liked.isError ? (
          <ErrorMessage
            error={liked.error}
            onRetry={() => void liked.refetch()}
          />
        ) : liked.data.content.length ? (
          <SongList
            songs={liked.data.content
              .filter(
                (song) =>
                  !blocked.some((channel) => channel.id === song.channel_id)
              )
              .map((song) => ({ ...song, liked: true }))}
            source={{ id: "liked", title: "Liked songs" }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No liked songs yet.</p>
        )}
      </section>
    </div>
  )
}

export function MusicLiked() {
  useDocumentTitle("Liked Songs")
  const userId = useAuth((s) => s.user?.id ?? null)
  const blocked = useSettings((s) => s.blockedChannels)
  const [page, setPage] = useState(1)
  const liked = useQuery({
    queryKey: ["musicdex", "liked", userId, page],
    queryFn: ({ signal }) => musicApi.likedSongs(page, signal),
    enabled: !!userId,
  })
  if (!userId)
    return (
      <StateMessage title="Sign in to see your liked songs">
        <Link className="text-primary underline" to="/login">
          Sign in
        </Link>
      </StateMessage>
    )
  const songs = (liked.data?.content ?? [])
    .filter(
      (song) => !blocked.some((channel) => channel.id === song.channel_id)
    )
    .map((song) => ({ ...song, liked: true }))
  const source = { id: "liked", title: "Liked songs" }
  return (
    <main className="mx-auto w-full max-w-370 min-w-0 space-y-9 px-[clamp(16px,3vw,44px)] pt-6 pb-14 max-md:space-y-7 max-md:p-4 max-md:pb-9">
      <MusicNavigation />
      {liked.isPending ? (
        <MusicLikedSkeleton />
      ) : liked.isError ? (
        <ErrorMessage
          error={liked.error}
          onRetry={() => void liked.refetch()}
        />
      ) : (
        <>
          {liked.data.content.length ? (
            <>
              <div className="flex items-center gap-2">
                <PlaySongsButton
                  songs={songs}
                  source={source}
                  label="Play songs on page"
                />
                <AddToQueueButton songs={songs} label="Add page to queue" />
              </div>
              <SongList songs={songs} source={source} />
            </>
          ) : (
            <StateMessage title="No liked songs yet" />
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm">Page {page}</span>
            <Button
              variant="outline"
              disabled={page >= liked.data.page_count}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </main>
  )
}

export function MusicRadios() {
  useDocumentTitle("Music Radios")
  const org = useOrgStore((s) => s.currentOrg.name)
  const userId = useAuth((s) => s.user?.id ?? null)
  const radios = useInfiniteQuery({
    queryKey: ["musicdex", "discovery", "playlists", org, "radio"],
    queryFn: ({ pageParam, signal }) =>
      musicApi.discoveryPlaylists(org, "radio", pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      pages.reduce((n, page) => n + page.items.length, 0) < lastPage.total &&
      lastPage.items.length
        ? pages.reduce((n, page) => n + page.items.length, 0)
        : undefined,
  })
  const starred = useQuery({
    queryKey: ["musicdex", "starredPlaylists", userId],
    queryFn: ({ signal }) => musicApi.starredPlaylists(signal),
    enabled: !!userId,
  })
  const items = radios.data?.pages.flatMap((page) => page.items) ?? []
  const saved =
    starred.data?.filter(
      (playlist) =>
        playlist.type.startsWith("radio") ||
        playlist.id.startsWith(":artist") ||
        playlist.id.startsWith(":hot")
    ) ?? []
  return (
    <main className="mx-auto w-full max-w-370 min-w-0 space-y-9 px-[clamp(16px,3vw,44px)] pt-6 pb-14 max-md:space-y-7 max-md:p-4 max-md:pb-9">
      <MusicNavigation />
      {!!userId && (
        <section>
          {starred.isPending ? (
            <p>Loading saved radios…</p>
          ) : starred.isError ? (
            <ErrorMessage
              error={starred.error}
              onRetry={() => void starred.refetch()}
            />
          ) : saved.length ? (
            <PlaylistCards title="Saved radios" playlists={saved} grid />
          ) : (
            <p className="text-sm text-muted-foreground">
              You have no saved radios yet.
            </p>
          )}
        </section>
      )}
      <section className="space-y-3">
        {radios.isPending ? (
          <MusicLoading label="Loading radios" />
        ) : radios.isError && !radios.data ? (
          <ErrorMessage
            error={radios.error}
            onRetry={() => void radios.refetch()}
          />
        ) : items.length ? (
          <>
            <PlaylistCards title="Tune in" playlists={items} grid />
            {radios.isFetchNextPageError && (
              <ErrorMessage
                error={radios.error}
                onRetry={() => void radios.fetchNextPage()}
              />
            )}
            {radios.hasNextPage && (
              <Button
                variant="outline"
                disabled={radios.isFetchingNextPage}
                onClick={() => void radios.fetchNextPage()}
              >
                {radios.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            )}
          </>
        ) : (
          <StateMessage title={`No radios found for ${org}`} />
        )}
      </section>
    </main>
  )
}

export function MusicBrowse() {
  const { type } = useParams()
  const org = useOrgStore((s) => s.currentOrg.name)
  const category = type === "ugp" ? "ugp" : "sgp"
  const title = category === "ugp" ? "Community playlists" : "Playlists"
  useDocumentTitle(`${org} ${title}`)
  const listing = useInfiniteQuery({
    queryKey: ["musicdex", "discovery", "playlists", org, category],
    queryFn: ({ pageParam, signal }) =>
      musicApi.discoveryPlaylists(org, category, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => {
      const count = pages.reduce((sum, page) => sum + page.items.length, 0)
      return count < last.total && last.items.length ? count : undefined
    },
  })
  const items = listing.data?.pages.flatMap((page) => page.items) ?? []
  return (
    <main className="mx-auto w-full max-w-370 min-w-0 space-y-9 px-[clamp(16px,3vw,44px)] pt-6 pb-14 max-md:space-y-7 max-md:p-4 max-md:pb-9">
      <MusicNavigation />
      {listing.isPending ? (
        <MusicLoading label="Loading playlists" />
      ) : listing.isError && !listing.data ? (
        <ErrorMessage
          error={listing.error}
          onRetry={() => void listing.refetch()}
        />
      ) : items.length ? (
        <>
          <PlaylistCards title={title} playlists={items} grid />
          {listing.isFetchNextPageError && (
            <ErrorMessage
              error={listing.error}
              onRetry={() => void listing.fetchNextPage()}
            />
          )}
          {listing.hasNextPage && (
            <Button
              variant="outline"
              disabled={listing.isFetchingNextPage}
              onClick={() => void listing.fetchNextPage()}
            >
              {listing.isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          )}
        </>
      ) : (
        <StateMessage title={`No playlists found for ${org}`} />
      )}
    </main>
  )
}
