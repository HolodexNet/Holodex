import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  DiscoverySections,
  PlaylistCards,
} from "@/components/music/discovery/sections"
import { MusicSignInBanner } from "@/components/music/shared"
import { Button } from "@/components/ui/button"
import { SongList, SongListSkeleton } from "@/components/music/song-list"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AddToQueueButton,
  MusicHero,
  PlaySongsButton,
} from "@/components/music/hero"
import {
  MusicSectionHeading,
  MusicLoading,
} from "@/components/music/page-header"
import { MusicArtwork } from "@/components/music/artwork"
import { MusicLikedSkeleton } from "@/components/music/skeletons"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"
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
  const { t } = useT()
  const { org: routeOrg } = useParams()
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const orgs = useOrgs()
  const match = orgs.data?.find((item) => item.name === routeOrg)
  useEffect(() => {
    if (match) setCurrentOrg(match)
  }, [match, setCurrentOrg])
  if (orgs.isPending)
    return <MusicLoading label={t("musicdex.common.loadingMusic")} />
  return <Navigate to="/#music" replace />
}

/** The Musicdex discovery page, shown as a tab of the main home page. */
export function MusicHomeTab() {
  const { t } = useT()
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
        scope={{ type: "org", name: org }}
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
      <section className="rounded-[16px] border border-border bg-[color-mix(in_oklch,var(--card)_70%,transparent)] p-6 max-md:px-2.5 max-md:py-4.5 [&_.music-section-heading]:mb-4.5 max-md:[&_.music-section-heading]:px-1.5 max-md:[&_.music-section-heading_button]:text-[11px]">
        <MusicSectionHeading
          title={t("musicdex.home.popularSongs")}
          description={t("musicdex.home.popularSongsDescription")}
        >
          {trending.isPending ? (
            <Skeleton className="h-8 w-24" aria-hidden="true" />
          ) : songs.length ? (
            <div className="flex items-center gap-2">
              <PlaySongsButton
                songs={songs}
                source={{
                  id: `trending:${org}`,
                  title: t("musicdex.home.trendingSongs", { org }),
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
            source={{
              id: `trending:${org}`,
              title: t("musicdex.home.trendingSongs", { org }),
            }}
            preview={20}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("musicdex.home.noTrendingSongs")}
          </p>
        )}
      </section>
    </div>
  )
}

/** Public discovery composed from favorite channels, ten channels at a time. */
function useFavoriteDiscovery() {
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
  return {
    favorites,
    favoriteChannels,
    discovery,
    playlists,
    streams,
    hasMore: favoriteChannels.length < eligibleChannels.length,
    loadMore: () => setVisibleCount((count) => count + 10),
  }
}

function FavoriteDiscoveryStatus({
  discovery,
  hasMore,
  loadMore,
}: Pick<
  ReturnType<typeof useFavoriteDiscovery>,
  "discovery" | "hasMore" | "loadMore"
>) {
  const { t } = useT()
  return (
    <>
      {discovery.some((item) => item.isPending) && (
        <p className="text-sm text-muted-foreground">
          {t("musicdex.home.loadingFavoriteMusic")}
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
      {hasMore && (
        <Button
          variant="outline"
          disabled={discovery.some((item) => item.isPending)}
          onClick={loadMore}
        >
          {t("musicdex.home.loadMoreFavorites")}
        </Button>
      )}
    </>
  )
}

function FavoritesSignIn() {
  const { t } = useT()
  return (
    <div className="space-y-9 max-md:space-y-7">
      <MusicSignInBanner
        title={t("musicdex.home.signInTitle")}
        description={t("musicdex.home.signInDescription")}
        action={t("musicdex.home.signInAction")}
        art={
          <MusicArtwork
            title={t("musicdex.home.favoritesArtworkTitle")}
            seed="favorites"
            radio
          />
        }
      />
    </div>
  )
}

/** Musicdex for favorited channels, shown as a tab of the favorites page. */
export function MusicFavoritesTab() {
  const { t } = useT()
  const userId = useAuth((s) => s.user?.id ?? null)
  const blocked = useSettings((s) => s.blockedChannels)
  const {
    favorites,
    favoriteChannels,
    discovery,
    playlists,
    streams,
    hasMore,
    loadMore,
  } = useFavoriteDiscovery()
  const liked = useQuery({
    queryKey: ["musicdex", "liked", userId, 1],
    queryFn: ({ signal }) => musicApi.likedSongs(1, signal),
    enabled: !!userId,
  })
  if (!userId) return <FavoritesSignIn />
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      <MusicHero
        scope={{ type: "favorites" }}
        playlists={playlists}
        favorites
        songs={(liked.data?.content ?? []).filter(
          (song) => !blocked.some((channel) => channel.id === song.channel_id)
        )}
      />
      {favorites.isPending ? (
        <p className="text-sm text-muted-foreground">
          {t("musicdex.home.loadingFavorites")}
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
          <FavoriteDiscoveryStatus
            discovery={discovery}
            hasMore={hasMore}
            loadMore={loadMore}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("musicdex.home.favoritesEmptyMusic")}
        </p>
      )}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("musicdex.sidebar.likedSongs")}
          </h2>
          <Link
            to="/music/liked"
            className="text-sm text-primary hover:underline"
          >
            {t("musicdex.discovery.seeAll")}
          </Link>
        </div>
        {liked.isPending ? (
          <p className="text-sm text-muted-foreground">
            {t("musicdex.home.loadingLikedSongs")}
          </p>
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
            source={{ id: "liked", title: t("musicdex.sidebar.likedSongs") }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("musicdex.home.noLikedSongs")}
          </p>
        )}
      </section>
    </div>
  )
}

export function MusicLiked() {
  const { t } = useT()
  useDocumentTitle(t("musicdex.home.likedDocumentTitle"))
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
      <StateMessage title={t("musicdex.home.signInToSeeLiked")}>
        <Link className="text-primary underline" to="/login">
          {t("musicdex.home.signIn")}
        </Link>
      </StateMessage>
    )
  const songs = (liked.data?.content ?? [])
    .filter(
      (song) => !blocked.some((channel) => channel.id === song.channel_id)
    )
    .map((song) => ({ ...song, liked: true }))
  const source = { id: "liked", title: t("musicdex.sidebar.likedSongs") }
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
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
                  label={t("musicdex.home.playSongsOnPage")}
                />
                <AddToQueueButton
                  songs={songs}
                  label={t("musicdex.home.addPageToQueue")}
                />
              </div>
              <SongList songs={songs} source={source} />
            </>
          ) : (
            <StateMessage title={t("musicdex.home.noLikedSongsTitle")} />
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              {t("musicdex.channel.previous")}
            </Button>
            <span className="text-sm">
              {t("musicdex.channel.page", { page })}
            </span>
            <Button
              variant="outline"
              disabled={page >= liked.data.page_count}
              onClick={() => setPage(page + 1)}
            >
              {t("musicdex.channel.next")}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function SavedRadios() {
  const { t } = useT()
  const userId = useAuth((s) => s.user?.id ?? null)
  const starred = useQuery({
    queryKey: ["musicdex", "starredPlaylists", userId],
    queryFn: ({ signal }) => musicApi.starredPlaylists(signal),
    enabled: !!userId,
  })
  const saved =
    starred.data?.filter(
      (playlist) =>
        playlist.type.startsWith("radio") ||
        playlist.id.startsWith(":artist") ||
        playlist.id.startsWith(":hot")
    ) ?? []
  return (
    <section>
      {starred.isPending ? (
        <p>{t("musicdex.home.loadingSavedRadios")}</p>
      ) : starred.isError ? (
        <ErrorMessage
          error={starred.error}
          onRetry={() => void starred.refetch()}
        />
      ) : saved.length ? (
        <PlaylistCards
          title={t("musicdex.home.savedRadios")}
          playlists={saved}
          grid
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("musicdex.home.noSavedRadios")}
        </p>
      )}
    </section>
  )
}

function OrgRadios() {
  const { t } = useT()
  const org = useOrgStore((s) => s.currentOrg.name)
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
  const items = radios.data?.pages.flatMap((page) => page.items) ?? []
  return (
    <section className="space-y-3">
      {radios.isPending ? (
        <MusicLoading label={t("musicdex.home.loadingRadios")} />
      ) : radios.isError && !radios.data ? (
        <ErrorMessage
          error={radios.error}
          onRetry={() => void radios.refetch()}
        />
      ) : items.length ? (
        <>
          <PlaylistCards
            title={t("musicdex.home.tuneIn")}
            playlists={items}
            grid
          />
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
              {radios.isFetchingNextPage
                ? t("musicdex.sidebar.loading")
                : t("component.loadMore")}
            </Button>
          )}
        </>
      ) : (
        <StateMessage title={t("musicdex.home.noRadiosForOrg", { org })} />
      )}
    </section>
  )
}

function FavoriteRadios() {
  const { t } = useT()
  const {
    favorites,
    favoriteChannels,
    discovery,
    playlists,
    hasMore,
    loadMore,
  } = useFavoriteDiscovery()
  const radios = playlists.filter((playlist) =>
    playlist.type?.startsWith("radio")
  )
  const loading = discovery.some((item) => item.isPending)
  if (favorites.isPending)
    return <MusicLoading label={t("musicdex.home.loadingFavoriteChannels")} />
  if (favorites.isError)
    return (
      <ErrorMessage
        error={favorites.error}
        onRetry={() => void favorites.refetch()}
      />
    )
  if (!favoriteChannels.length)
    return (
      <p className="text-sm text-muted-foreground">
        {t("musicdex.home.favoritesEmptyRadios")}
      </p>
    )
  return (
    <section className="space-y-3">
      {radios.length || loading ? (
        <PlaylistCards
          title={t("musicdex.discovery.oshiRadios")}
          playlists={radios}
          grid
          loading={loading && !radios.length}
        />
      ) : (
        <StateMessage title={t("musicdex.home.noRadiosForFavorites")} />
      )}
      <FavoriteDiscoveryStatus
        discovery={discovery}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    </section>
  )
}

/** Saved radios plus the catalog for the home page's scope, as a home tab. */
export function MusicRadiosTab({ favorites = false }: { favorites?: boolean }) {
  const loggedIn = useAuth((s) => !!s.user)
  if (favorites && !loggedIn) return <FavoritesSignIn />
  return (
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      {loggedIn && <SavedRadios />}
      {favorites ? <FavoriteRadios /> : <OrgRadios />}
    </div>
  )
}

export function MusicBrowse() {
  const { t } = useT()
  const { type } = useParams()
  const org = useOrgStore((s) => s.currentOrg.name)
  const category = type === "ugp" ? "ugp" : "sgp"
  const title =
    category === "ugp"
      ? t("musicdex.home.communityPlaylists")
      : t("musicdex.home.playlists")
  useDocumentTitle(t("musicdex.home.browseDocumentTitle", { org, title }))
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
    <div className="container mx-auto space-y-9 max-md:space-y-7">
      {listing.isPending ? (
        <MusicLoading label={t("musicdex.home.loadingPlaylists")} />
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
              {listing.isFetchingNextPage
                ? t("musicdex.sidebar.loading")
                : t("component.loadMore")}
            </Button>
          )}
        </>
      ) : (
        <StateMessage title={t("musicdex.home.noPlaylistsForOrg", { org })} />
      )}
    </div>
  )
}
