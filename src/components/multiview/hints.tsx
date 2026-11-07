import {
  FastForwardIcon,
  GridFourIcon,
  KeyboardIcon,
  PencilSimpleIcon,
  SlidersHorizontalIcon,
  VideoCameraIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"

/** Shown on an empty grid, in place of anything to look at. */
export function Hints() {
  const { t } = useT()
  const iconClass = "mx-1 inline size-4 align-text-bottom"
  const html = (key: string) => ({ __html: t(key) })
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-auto p-6 text-center">
      <p className="max-w-xl text-sm text-muted-foreground">
        <span dangerouslySetInnerHTML={html("views.multiview.autoLayoutTip")} />.{" "}
        <span dangerouslySetInnerHTML={html("views.multiview.createLayoutTip")} />.
      </p>
      <div className="flex max-w-xl flex-col gap-2 text-left text-sm">
        <h2 className="text-2xl font-semibold" dangerouslySetInnerHTML={html("views.multiview.hints")} />
        <ol className="list-decimal">
          <li>
            <GridFourIcon className={iconClass} />
            <span dangerouslySetInnerHTML={html("views.multiview.presetsHint")} />
          </li>
          <li>
            <SlidersHorizontalIcon className={iconClass} />
            <span dangerouslySetInnerHTML={html("views.multiview.mediaControlsHint1")} />
          </li>
          <li>
            <VideoCameraIcon className={iconClass} />
            <span dangerouslySetInnerHTML={html("views.multiview.dragDropHint")} />
          </li>
          <li>
            <PencilSimpleIcon className={iconClass} />
            <span dangerouslySetInnerHTML={html("views.multiview.editHint")} />
          </li>
          <li>
            <KeyboardIcon className={iconClass} />
            <span dangerouslySetInnerHTML={html("views.multiview.shortcuts.hint")} />
          </li></ol>
      </div>
    </div>
  )
}
