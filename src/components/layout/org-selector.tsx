import { useMemo, useState } from "react"
import { cn } from "cn"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  StarFillIcon,
  StarIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ALL_VTUBERS, ORGS_PREFIX } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { useOrgs } from "@/lib/queries"
import type { Org } from "@/lib/types"
import { useOrgStore } from "@/stores/org"

const ALL_ORG: Org = { name: ALL_VTUBERS, short: "Vtuber" }

export const orgShortName = (org: Org) =>
  ORGS_PREFIX[org.name] ?? org.short ?? org.name

function OrgIcon({ org }: { org: Org }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
      {org.icon && !failed ? (
        <img
          src={`/statics/channelImg/${org.icon}/50.png`}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        org.name.slice(0, 1)
      )}
    </span>
  )
}

/**
 * The "<Org>dex" wordmark doubles as the organization switcher: starred
 * organizations are one click away, the full directory is behind "Show all".
 */
export function OrgSelector() {
  const { t } = useT()
  const currentOrg = useOrgStore((s) => s.currentOrg)
  const favorites = useOrgStore((s) => s.orgFavorites)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label={t("component.orgSelector.change", [currentOrg.name])}
              className="group flex h-9 min-w-0 items-center rounded-xl px-1.5 text-xl font-medium tracking-tight outline-none hover:bg-foreground/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:bg-foreground/5"
            />
          }
        >
          <span className="truncate">{orgShortName(currentOrg)}</span>
          <span className="text-brand">dex</span>
          <CaretDownIcon className="ml-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto min-w-56">
          {favorites.map((org) => (
            <DropdownMenuItem key={org.name} onClick={() => setCurrentOrg(org)}>
              <span className="flex-1">{org.name}</span>
              {org.name === currentOrg.name && <CheckIcon className="text-brand" />}
            </DropdownMenuItem>
          ))}
          {favorites.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            className="text-brand focus:text-brand!"
            onClick={() => setDialogOpen(true)}
          >
            {t("views.favorites.showall")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OrgDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

function OrgDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useT()
  const orgs = useOrgs()
  const currentOrg = useOrgStore((s) => s.currentOrg)
  const favorites = useOrgStore((s) => s.orgFavorites)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const toggleFavorite = useOrgStore((s) => s.toggleFavorite)
  const moveFavorite = useOrgStore((s) => s.moveFavorite)
  const [search, setSearch] = useState("")

  // Starred organizations first, in the viewer's order; then everything else
  // in the directory's own order (largest first).
  const sorted = useMemo(() => {
    const all = [ALL_ORG, ...(orgs.data ?? [])]
    const byName = new Map(all.map((org) => [org.name, org]))
    const starred = favorites.map((fav) => byName.get(fav.name) ?? fav)
    const starredNames = new Set(favorites.map((fav) => fav.name))
    const rest = all.filter((org) => !starredNames.has(org.name))
    const needle = search.trim().toLowerCase()
    const matches = (org: Org) =>
      !needle ||
      org.name.toLowerCase().includes(needle) ||
      !!org.name_jp?.toLowerCase().includes(needle)
    return {
      starredNames,
      list: [...starred, ...rest].filter(matches),
    }
  }, [orgs.data, favorites, search])

  const pick = (org: Org) => {
    setCurrentOrg({ ...org, short: orgShortName(org) })
    onOpenChange(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-4 p-4 sm:max-w-lg sm:p-5">
        <DialogHeader className="px-1">
          <DialogTitle>{t("views.channels.sortOptions.org")}</DialogTitle>
          <DialogDescription>{t("component.orgSelector.hint")}</DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupAddon>
            <MagnifyingGlassIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("component.search.searchLabel")}
            aria-label={t("component.search.searchLabel")}
          />
        </InputGroup>

        <ul className="-mx-1 min-h-40 flex-1 overflow-y-auto px-1">
          {sorted.list.map((org) => {
            const starred = sorted.starredNames.has(org.name)
            const index = favorites.findIndex((fav) => fav.name === org.name)
            return (
              <li
                key={org.name}
                className={cn(
                  "group/org flex items-center gap-1 rounded-xl pr-1 hover:bg-accent",
                  org.name === currentOrg.name && "bg-accent"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={starred}
                  aria-label={t("component.orgSelector.star", [org.name])}
                  className={cn(
                    "hover:bg-transparent",
                    starred ? "text-amber-400" : "text-muted-foreground/60"
                  )}
                  onClick={() => toggleFavorite(org)}
                >
                  {starred ? <StarFillIcon /> : <StarIcon />}
                </Button>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 py-1.5 text-left text-sm outline-none focus-visible:underline"
                  onClick={() => pick(org)}
                >
                  <OrgIcon org={org} />
                  <span className="min-w-0 flex-1 truncate">
                    {org.name}
                    {org.name_jp && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {org.name_jp}
                      </span>
                    )}
                  </span>
                </button>
                {starred && !search && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index <= 0}
                      aria-label={t("component.orgSelector.moveUp", [org.name])}
                      onClick={() => moveFavorite(org.name, -1)}
                    >
                      <ArrowUpIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === favorites.length - 1}
                      aria-label={t("component.orgSelector.moveDown", [org.name])}
                      onClick={() => moveFavorite(org.name, 1)}
                    >
                      <ArrowDownIcon />
                    </Button>
                  </>
                )}
              </li>
            )
          })}
          {sorted.list.length === 0 && !orgs.isPending && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              {t("component.orgSelector.noMatch")}
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
