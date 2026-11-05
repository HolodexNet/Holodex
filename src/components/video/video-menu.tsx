import { Fragment } from "react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import {
  CalendarBlankIcon,
  CheckIcon,
  DotsThreeVerticalIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  LogoYoutubeIcon,
  LogoTwitchIcon,
  ArrowSquareOutIcon,
  NotePencilIcon,
  TrashIcon,
  UserIcon,
  SquaresFourIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import { singleVideoPath } from "@/lib/multiview/codec"
import { toMultiviewVideo } from "@/lib/multiview/stream"
import {
  availableVideoActions,
  videoActionIssue,
} from "@/lib/selection-actions"
import type { Video } from "@/lib/types"
import { videoTitle, watchPath } from "@/lib/video"
import { editPath } from "@/lib/video-edit/routes"
import { isVideoPlaceholder, videoSource } from "@/lib/video-source"
import { useSettings } from "@/stores/settings"
import { useAuth } from "@/stores/auth"
import { useSelectionAction } from "@/stores/selection-action"
import { useSelection, useSelectionScopes } from "@/stores/selection"
import { useSelectionScope } from "@/components/selection/selection-scope"

/** `YYYYMMDDTHHmmssZ`, the UTC timestamp format calendar links expect. */
const calendarStamp = (date: Date) =>
  date.toISOString().replace(/[-:]|\.\d{3}/g, "")

const menuClassName =
  "w-60 max-w-[calc(100vw-1rem)] p-1.5 [&_[role=menuitem]]:rounded-lg"

function googleCalendarUrl(video: Video, title: string): string {
  const start = new Date(
    video.start_scheduled ?? video.available_at ?? Date.now()
  )
  const end = new Date(start.getTime() + (video.duration || 3600) * 1000)
  const link = videoSource(video).url ?? ""
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
    details: link,
  })
  return `https://www.google.com/calendar/render?${params}`
}

export function VideoMenu({
  video,
  className,
}: {
  video: Video
  className?: string
}) {
  const { t } = useT()
  const user = useAuth((state) => state.user)
  const scope = useSelectionScope()
  const selecting = useSelection((state) => state.selecting)
  const navigate = useNavigate()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const isBlocked = useSettings((s) =>
    s.blockedChannels.some((c) => c.id === video.channel.id)
  )
  const toggleBlocked = useSettings((s) => s.toggleBlocked)
  const isPlaceholder = isVideoPlaceholder(video)
  const source = videoSource(video)
  const multiviewStream = toMultiviewVideo(video)
  const title = videoTitle(video, preferEnglish)
  // Group-only actions belong in the selection tray, not on a single video, and
  // the editor covers mentions and topics better than a bulk dialog of one.
  const editActions = availableVideoActions(user)
    .filter(
      (action) =>
        action.id !== "copy-links" &&
        action.id !== "add-mentions" &&
        action.id !== "set-topic"
    )
    .filter((action) => !videoActionIssue(action, [video]))
  const canSelect = scope && !selecting

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${watchPath(video.id)}`
      )
      toast.success(t("component.videoCard.copiedToClipboard"))
    } catch {
      toast.error(t("component.videoCard.copyFailed"))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={className}
            aria-label={t("component.videoCard.moreActions")}
          />
        }
      >
        <DotsThreeVerticalIcon className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className={menuClassName}>
        {!isPlaceholder && source.url && (
          <DropdownMenuItem
            render={
              <a href={source.url!} target="_blank" rel="noopener noreferrer" />
            }
          >
            {source.provider === "twitch" ? (
              <LogoTwitchIcon className="text-muted-foreground" />
            ) : source.provider === "youtube" ? (
              <LogoYoutubeIcon className="text-muted-foreground" />
            ) : (
              <ArrowSquareOutIcon className="text-muted-foreground" />
            )}
            {source.provider === "youtube"
              ? t("views.settings.redirectModeLabel")
              : source.provider === "twitch"
                ? t("component.videoCard.openOnPlatform", {
                    platform: "Twitch",
                  })
                : t("component.placeholderVideo.streamPageBtn")}
          </DropdownMenuItem>
        )}
        {!isPlaceholder && (
          <DropdownMenuItem onClick={copyLink}>
            <LinkIcon className="text-muted-foreground" />
            {t("component.videoCard.copyLink")}
          </DropdownMenuItem>
        )}
        {video.status === "upcoming" && (
          <DropdownMenuItem
            render={
              <a
                href={googleCalendarUrl(video, title)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <CalendarBlankIcon className="text-muted-foreground" />
            {t("component.videoCard.googleCalendar")}
          </DropdownMenuItem>
        )}
        {multiviewStream && (
          <DropdownMenuItem
            onClick={() => navigate(singleVideoPath(multiviewStream))}
          >
            <SquaresFourIcon className="text-muted-foreground" />
            {t("component.mainNav.multiview")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => navigate(`/channel/${video.channel.id}`)}
        >
          <UserIcon className="text-muted-foreground" />
          {t("component.videoCard.viewChannel")}
        </DropdownMenuItem>
        {(canSelect || user) && <DropdownMenuSeparator className="mx-1.5" />}
        {canSelect && (
          <DropdownMenuItem
            onClick={() => {
              useSelectionScopes.getState().activate(scope.id)
              useSelection.getState().enter({ video, scope: scope.id })
            }}
          >
            <CheckIcon className="text-muted-foreground" />
            {t("selection.startHere")}
          </DropdownMenuItem>
        )}
        {user && (
          <DropdownMenuItem render={<Link to={editPath(video.id)} />}>
            <NotePencilIcon className="text-muted-foreground" />
            {t("component.videoCard.editVideo")}
          </DropdownMenuItem>
        )}
        {editActions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2.5 [&>svg]:text-muted-foreground">
              <LinkIcon />
              {t("videoEdit.moreEdits")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className={menuClassName}
              sideOffset={6}
              alignOffset={-6}
            >
              {editActions.map((action, index) => {
                const destructive =
                  "destructive" in action && action.destructive
                const previous = editActions[index - 1]
                const Icon =
                  action.id === "dissociate-video"
                    ? LinkIcon
                    : action.id === "dissociate-channel"
                      ? UserIcon
                      : TrashIcon

                return (
                  <Fragment key={action.id}>
                    {destructive &&
                      previous &&
                      !("destructive" in previous && previous.destructive) && (
                        <DropdownMenuSeparator className="mx-1.5" />
                      )}
                    <DropdownMenuItem
                      variant={destructive ? "destructive" : "default"}
                      onClick={() =>
                        useSelectionAction
                          .getState()
                          .open([{ video, token: "" }], action.id)
                      }
                    >
                      <Icon
                        className={
                          destructive ? undefined : "text-muted-foreground"
                        }
                      />
                      {t(action.label)}
                    </DropdownMenuItem>
                  </Fragment>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator className="mx-1.5" />
        <DropdownMenuItem onClick={() => toggleBlocked(video.channel)}>
          {isBlocked ? (
            <EyeIcon className="text-muted-foreground" />
          ) : (
            <EyeSlashIcon className="text-muted-foreground" />
          )}
          {isBlocked
            ? t("component.videoCard.unblockChannel")
            : t("component.videoCard.blockChannel")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
