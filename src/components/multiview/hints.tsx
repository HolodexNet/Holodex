import {
  FastForwardIcon,
  GridFourIcon,
  PencilSimpleIcon,
  SlidersHorizontalIcon,
  VideoCameraIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"

/** Shown on an empty grid, in place of anything to look at. */
export function Hints() {
  const { t } = useT()
  const iconClass = "mx-1 inline size-4 align-text-bottom"
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-auto p-6 text-center">
      <p className="max-w-xl text-sm text-muted-foreground">
        {t("views.multiview.autoLayoutTip")}.{" "}
        {t("views.multiview.createLayoutTip")}.
      </p>
      <div className="flex max-w-xl flex-col gap-2 text-left text-sm">
        <h2 className="text-2xl font-semibold">{t("views.multiview.hints")}</h2>
        <p>
          1.
          <GridFourIcon className={iconClass} />
          {t("views.multiview.presetsHint")}
        </p>
        <p>
          2.
          <SlidersHorizontalIcon className={iconClass} />
          {t("views.multiview.mediaControlsHint1")}
          <FastForwardIcon className={iconClass} />
          {t("views.multiview.mediaControlsHint2")}
        </p>
        <p>
          3.
          <VideoCameraIcon className={iconClass} />
          {t("views.multiview.dragDropHint")}
        </p>
        <p>
          4.
          <PencilSimpleIcon className={iconClass} />
          {t("views.multiview.editHint")}
        </p>
      </div>
    </div>
  )
}
