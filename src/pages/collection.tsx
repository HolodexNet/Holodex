import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  BrowseChannels,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingCards,
  PageHeading,
} from "@/components/common";
import { VideoCard, timeLabel } from "@/components/video-card";
import {
  HeartIcon,
  HeartFilledIcon,
  BookmarkIcon,
  SearchIcon,
  MultiviewIcon,
  CloseIcon,
  ExternalIcon,
  ArrowUpRightIcon,
  PlayIcon,
} from "@/components/icons";
import { api, isPlayable, watchUrl } from "@/lib/api";
import { channelName, usePreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";

export function ChannelsPage() {
  const { prefs, favorites, toggleFavorite } = usePreferences();
  const [text, setText] = useState("");
  const data = useInfiniteQuery({
    queryKey: ["channels", prefs.org],
    initialPageParam: 0,
    queryFn: ({ signal, pageParam }) =>
      api.channels(prefs.org, pageParam, signal),
    getNextPageParam: (last, pages) =>
      last.length === 48 ? pages.length * 48 : undefined,
    staleTime: 180_000,
  });
  const all = data.data?.pages.flat() || [];
  const channels = all.filter((c) =>
    `${c.name} ${c.english_name || ""}`
      .toLowerCase()
      .includes(text.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Find your people"
        description={`Meet the creators of ${prefs.org === "all" ? "the VTuber community" : prefs.org}. Favorite a channel to keep them close.`}
      />
      <div className="relative mb-7 max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Filter loaded channels"
          placeholder="Filter loaded channels…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-xl bg-card pl-9"
        />
      </div>
      {data.error ? (
        <ErrorState error={data.error} retry={() => void data.refetch()} />
      ) : data.isPending ? (
        <LoadingCards />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {channels.map((channel) => {
              const favorite = favorites.some((c) => c.id === channel.id);
              const name = channelName(channel, prefs.englishNames);
              return (
                <article
                  key={channel.id}
                  className="rounded-2xl border bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <Avatar channel={channel} className="size-14" />
                    <IconButton
                      label={
                        favorite ? `Unfavorite ${name}` : `Favorite ${name}`
                      }
                      className={cn(favorite && "text-primary-ink")}
                      onClick={() => toggleFavorite(channel)}
                    >
                      {favorite ? <HeartFilledIcon /> : <HeartIcon />}
                    </IconButton>
                  </div>
                  <h2 className="mt-4 truncate text-sm font-semibold">
                    {name}
                  </h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {channel.org || "Independent"}
                    {channel.inactive ? " · Inactive" : ""}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 w-full rounded-lg text-xs"
                    render={
                      <Link
                        to={`/search?channel=${channel.id}&name=${encodeURIComponent(name)}`}
                      />
                    }
                  >
                    Browse videos
                    <ArrowUpRightIcon />
                  </Button>
                </article>
              );
            })}
          </div>
          {!channels.length && (
            <EmptyState
              title="No channels found"
              description="Try another name, load more channels, or change the organization in the sidebar."
            />
          )}
          {data.hasNextPage && (
            <div className="mt-7 flex justify-center">
              <Button
                variant="outline"
                disabled={data.isFetchingNextPage}
                onClick={() => void data.fetchNextPage()}
              >
                {data.isFetchingNextPage ? "Loading…" : "Load more channels"}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
export function LibraryPage() {
  const { saved, prefs } = usePreferences();
  return (
    <>
      <PageHeading
        title="Watch later"
        description={`${saved.length ? `${saved.length} saved ${saved.length === 1 ? "moment" : "moments"}. ` : ""}Good things are worth coming back to.`}
      />
      {saved.length ? (
        <div className={prefs.layout === "list" ? "video-list" : "video-grid"}>
          {saved.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              list={prefs.layout === "list"}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="A place for your next watch"
          description="Use the bookmark on any video to save it here. Your list stays in this browser."
          icon={<BookmarkIcon />}
        >
          <Button render={<Link to="/" />}>Find a stream</Button>
        </EmptyState>
      )}
    </>
  );
}
export function WatchPage() {
  const { id = "" } = useParams();
  const {
    prefs,
    favorites,
    toggleFavorite,
    saved,
    toggleSaved,
    queue,
    toggleQueue,
  } = usePreferences();
  const data = useQuery({
    queryKey: ["video", id],
    queryFn: ({ signal }) => api.video(id, signal),
    enabled: !!id,
    staleTime: 180_000,
  });
  if (data.error)
    return <ErrorState error={data.error} retry={() => void data.refetch()} />;
  if (!data.data) return <LoadingCards />;
  const video = data.data;
  const url = watchUrl(video);
  const favorite = favorites.some((c) => c.id === video.channel.id);
  const bookmarked = saved.some((v) => v.id === video.id);
  const queued = queue.some((v) => v.id === video.id);
  return (
    <div className="mx-auto max-w-6xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/" />}
        className="mb-4"
      >
        ← Back to streams
      </Button>
      {isPlayable(video) ? (
        <iframe
          title={video.title || "Holodex video player"}
          src={`https://www.youtube-nocookie.com/embed/${video.id}`}
          className="aspect-video w-full rounded-2xl border bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <EmptyState
          title={video.title || "Scheduled event"}
          description="This event has no embedded YouTube player. Use the event link if one is available."
          icon={<PlayIcon />}
        >
          {url && (
            <Button render={<a href={url} target="_blank" rel="noreferrer" />}>
              Open event
              <ExternalIcon />
            </Button>
          )}
        </EmptyState>
      )}
      <h1 className="mt-6 text-xl font-semibold leading-relaxed">
        {video.title || "Untitled stream"}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Avatar channel={video.channel} />
        <div className="mr-auto">
          <p className="text-sm font-semibold">
            {channelName(video.channel, prefs.englishNames)}
          </p>
          <p className="text-xs text-muted-foreground">{video.channel.org}</p>
        </div>
        <Button variant="outline" onClick={() => toggleFavorite(video.channel)}>
          {favorite ? <HeartFilledIcon /> : <HeartIcon />}
          {favorite ? "Favorited" : "Favorite"}
        </Button>
        <Button variant="outline" onClick={() => toggleSaved(video)}>
          <BookmarkIcon />
          {bookmarked ? "Saved" : "Watch later"}
        </Button>
        {isPlayable(video) && (
          <Button
            variant="outline"
            disabled={!queued && queue.length >= 4}
            onClick={() => toggleQueue(video)}
          >
            <MultiviewIcon />
            {queued ? "In multiview" : "Add to multiview"}
          </Button>
        )}
        {url && (
          <IconButton
            label="Open on YouTube"
            render={<a href={url} target="_blank" rel="noreferrer" />}
          >
            <ExternalIcon />
          </IconButton>
        )}
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{video.status}</Badge>
          {video.topic_id && (
            <Badge variant="secondary">
              {video.topic_id.replaceAll("_", " ")}
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {timeLabel(video, prefs.hour12)}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
          {video.description || "No description is available for this stream."}
        </p>
      </div>
    </div>
  );
}
export function MultiviewPage() {
  const { queue, toggleQueue, clearQueue } = usePreferences();
  return (
    <>
      <PageHeading
        title="Better together"
        description="Up to four streams, one shared moment. Audio starts muted so you can choose what to listen to."
      >
        {queue.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearQueue}>
            Clear multiview
          </Button>
        )}
      </PageHeading>
      {queue.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {queue.map((video) => (
            <article
              key={video.id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="line-clamp-1 flex-1 text-xs font-medium">
                  {video.title}
                </span>
                <IconButton
                  label={`Remove ${channelName(video.channel)} from multiview`}
                  size="icon-xs"
                  onClick={() => toggleQueue(video)}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <iframe
                title={video.title || channelName(video.channel)}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?mute=1`}
                className="aspect-video w-full bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="More streams. One screen."
          description="Add streams using the multiview icon on video cards, then watch them side by side here."
          icon={<MultiviewIcon />}
        >
          <Button render={<Link to="/" />}>Choose your streams</Button>
        </EmptyState>
      )}
    </>
  );
}
export function NotFoundPage() {
  return (
    <EmptyState
      title="This page wandered off"
      description="Head home to find live streams, or discover your next favorite channel."
    >
      <Button render={<Link to="/" />}>Back to home</Button>
      <BrowseChannels />
    </EmptyState>
  );
}
