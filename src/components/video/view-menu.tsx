import type { ReactNode } from "react"

import {
  GridFourIcon,
  GridNineIcon,
  ListBulletsIcon,
  RowsIcon,
  SquaresFourIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import { useSettings, type GridSize, type HomeViewMode } from "@/stores/settings"

/** Layout choices, flattened from (view mode, grid size) into one list. */
const VIEWS = [
  { id: "grid-0", mode: "grid", size: 0, icon: <SquaresFourIcon /> },
  { id: "grid-1", mode: "grid", size: 1, icon: <GridFourIcon /> },
  { id: "grid-2", mode: "grid", size: 2, icon: <GridNineIcon /> },
  { id: "list", mode: "list", size: 0, icon: <RowsIcon /> },
  { id: "denseList", mode: "denseList", size: 0, icon: <ListBulletsIcon /> },
] as const satisfies readonly {
  id: string
  mode: HomeViewMode
  size: GridSize
  icon: ReactNode
}[]

/** Picks how video lists are laid out; shared by every feed. */
export function ViewMenu() {
  const { t, tl } = useT()
  const mode = useSettings((s) => s.homeViewMode)
  const gridSize = useSettings((s) => s.gridSize)
  const set = useSettings((s) => s.set)

  const sizes = tl("views.settings.gridSize")
  const labels: Record<string, string> = {
    "grid-0": `${t("views.home.viewGrid")} · ${sizes[0] ?? "Large"}`,
    "grid-1": `${t("views.home.viewGrid")} · ${sizes[1] ?? "Medium"}`,
    "grid-2": `${t("views.home.viewGrid")} · ${sizes[2] ?? "Small"}`,
    list: t("views.home.viewList"),
    denseList: t("views.home.viewCompact"),
  }
  const current = mode === "grid" ? `grid-${gridSize}` : mode
  const currentView = VIEWS.find((v) => v.id === current) ?? VIEWS[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("views.settings.gridSizeLabel")}
          />
        }
      >
        {currentView.icon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("views.settings.gridSizeLabel")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={current}
            onValueChange={(id) => {
              const view = VIEWS.find((v) => v.id === id)
              if (!view) return
              set("homeViewMode", view.mode)
              if (view.mode === "grid") set("gridSize", view.size)
            }}
          >
            {VIEWS.map((view) => (
              <DropdownMenuRadioItem key={view.id} value={view.id}>
                {view.icon}
                {labels[view.id]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
