import { Link, useLocation, useParams } from "react-router"

import { StateMessage } from "@/components/common/state-message"
import {
  ArrowSquareOutIcon,
  HouseLineIcon,
  LogoYoutubeIcon,
  WarningIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"
import { youtubeUrl } from "@/lib/video"

/**
 * Stand-in for routes the rewrite has not reached yet (watch, channels,
 * multiview, ...). It keeps links working by pointing at the same path on the
 * current production site instead of dead-ending.
 */
export function NotReadyPage() {
  const { t } = useT()
  const location = useLocation()
  const { id } = useParams()
  const isWatch = location.pathname.startsWith("/watch/")
  const legacyUrl = `https://holodex.net${location.pathname}${location.search}${location.hash}`

  return (
    <StateMessage
      icon={<WarningIcon />}
      title={t("views.notReady.title")}
      description={t("views.notReady.description")}
    >
      <div className="flex flex-wrap justify-center gap-2">
        {isWatch && id && (
          <Button
            nativeButton={false}
            render={<a href={youtubeUrl(id)} target="_blank" rel="noopener noreferrer" />
            }
          >
            <LogoYoutubeIcon data-icon="inline-start" />
            {t("views.settings.redirectModeLabel")}
          </Button>
        )}
        <Button
          nativeButton={false}
          variant={isWatch ? "outline" : "default"}
          render={<a href={legacyUrl} target="_blank" rel="noopener noreferrer" />}
        >
          <ArrowSquareOutIcon data-icon="inline-start" />
          {t("views.notReady.openLegacy")}
        </Button>
      </div>
    </StateMessage>
  )
}

export function NotFoundPage() {
  const { t } = useT()
  useDocumentTitle(t("views.notFound.title"))

  return (
    <StateMessage icon={<WarningIcon />} title={t("views.notFound.title")}>
      <Button nativeButton={false} render={<Link to="/" />}>
        <HouseLineIcon data-icon="inline-start" />
        {t("views.notFound.back")}
      </Button>
    </StateMessage>
  )
}
