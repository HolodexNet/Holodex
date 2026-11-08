import { Link, useLocation } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  HeartIcon,
  HeartFillIcon,
  LogoYoutubeIcon,
  LogoTwitterIcon,
  LogoTwitchIcon,
  ProhibitIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import { useFavorites } from "@/lib/queries"
import { useFavoriteMutation } from "@/lib/channel-queries"
import type { Channel } from "@/lib/types"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"

export function ChannelActions({
  channel,
  compact = false,
}: {
  channel: Channel
  compact?: boolean
}) {
  const { t } = useT()
  const location = useLocation()
  const loggedIn = useAuth((s) => !!s.jwt)
  const {
    favorites,
    isPending: favoritesPending,
    isError: favoritesError,
  } = useFavorites()
  const mutation = useFavoriteMutation()
  const favorite = favorites.some((c) => c.id === channel.id)
  const blocked = useSettings((s) =>
    s.blockedChannels.some((c) => c.id === channel.id)
  )
  const toggleBlocked = useSettings((s) => s.toggleBlocked)
  const blockLabel = t(
    `component.channelSocials.${blocked ? "unblock" : "block"}`
  )
  const onToggleBlocked = () => {
    toggleBlocked(channel)
    const name = channel.english_name || channel.name
    toast(
      t(
        `component.channelSocials.${blocked ? "unblockedToast" : "blockedToast"}`,
        [name]
      ),
      {
        action: {
          label: t("component.channelSocials.undo"),
          onClick: () => toggleBlocked(channel),
        },
      }
    )
  }
  const blockButton = (
    <Button
      variant={blocked ? "destructive" : "ghost"}
      size={compact ? "icon-sm" : blocked ? "default" : "icon"}
      aria-pressed={blocked}
      title={blockLabel}
      aria-label={blockLabel}
      onClick={onToggleBlocked}
    >
      <ProhibitIcon />
      {blocked && !compact && t("component.channelSocials.blocked")}
    </Button>
  )
  const label = t(
    `component.channelSocials.${favorite ? "removeFromFavorites" : "addToFavorites"}`
  )
  return (
    <div className="flex flex-wrap items-center gap-2">
      {loggedIn ? (
        <Button
          size={compact ? "icon-sm" : "default"}
          variant={favorite ? "default" : "outline"}
          className={
            favorite
              ? "shadow-sm ring-2 ring-primary/25 ring-offset-2 ring-offset-card"
              : "bg-card/90 text-muted-foreground hover:text-brand"
          }
          aria-label={label}
          aria-pressed={favorite}
          title={label}
          disabled={mutation.isPending || favoritesPending || favoritesError}
          onClick={() =>
            mutation.mutate(
              { id: channel.id, favorite: !favorite },
              { onError: () => toast.error(t("component.apiError.generic")) }
            )
          }
        >
          {favorite ? <HeartFillIcon /> : <HeartIcon />}
          {!compact && label}
        </Button>
      ) : (
        <Button
          nativeButton={false}
          size={compact ? "icon-sm" : "default"}
          variant="outline"
          className="bg-card/90 text-muted-foreground hover:text-brand"
          title={t("component.channelList.signInToFavorite")}
          aria-label={t("component.channelList.signInToFavorite")}
          render={
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
            />
          }
        >
          <HeartIcon />
          {!compact && t("component.channelList.signInToFavorite")}
        </Button>
      )}
      {!compact && (
        <>
          <Button
            nativeButton={false}
            variant="outline"
            size="icon"
            aria-label="YouTube"
            title="YouTube"
            render={
              <a
                href={`https://www.youtube.com/channel/${channel.id}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <LogoYoutubeIcon />
          </Button>
          {channel.twitter && (
            <Button
              nativeButton={false}
              variant="outline"
              size="icon"
              aria-label="X / Twitter"
              title="X / Twitter"
              render={
                <a
                  href={`https://x.com/${encodeURIComponent(channel.twitter.replace(/^@/, ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <LogoTwitterIcon />
            </Button>
          )}
          {channel.twitch && (
            <Button
              nativeButton={false}
              variant="outline"
              size="icon"
              aria-label="Twitch"
              title="Twitch"
              render={
                <a
                  href={`https://twitch.tv/${encodeURIComponent(channel.twitch)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <LogoTwitchIcon />
            </Button>
          )}
          {blockButton}
        </>
      )}
      {/* Cards only offer the way back out; blocking lives on the channel page. */}
      {compact && blocked && blockButton}
    </div>
  )
}
