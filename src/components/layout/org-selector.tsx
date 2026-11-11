import { useMemo, useState } from "react"
import { cn } from "cn"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  GlobeIcon,
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
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

export const orgIconSrc = (icon: string, size = 50) =>
  `/statics/channelImg/${icon}/${size}.png`

export function OrgIcon({
  org,
  size,
  className,
}: {
  org: Org
  size?: number
  className?: string
}) {
  const [failedIcon, setFailedIcon] = useState<string | null>(null)
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-medium text-muted-foreground",
        className
      )}
    >
      {org.name === ALL_VTUBERS ? (
        <GlobeIcon className="size-4" />
      ) : org.icon && org.icon !== failedIcon ? (
        <img
          src={orgIconSrc(org.icon, size)}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailedIcon(org.icon!)}
        />
      ) : (
        org.name.slice(0, 1)
      )}
    </span>
  )
}

/**
 * Search the full organization directory, with starred organizations first.
 * Resolve stored selections against the feed so existing preferences get icons.
 */
export function OrgSelector({
  sidebar = false,
  onSelect,
}: {
  sidebar?: boolean
  onSelect?: (org: Org) => void
}) {
  const { t } = useT()
  const orgs = useOrgs()
  const currentOrg = useOrgStore((s) => s.currentOrg)
  const favorites = useOrgStore((s) => s.orgFavorites)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const organizations = useMemo(() => {
    const byName = new Map(
      [ALL_ORG, ...(orgs.data ?? [])].map((org) => [org.name, org])
    )
    if (!byName.has(currentOrg.name)) byName.set(currentOrg.name, currentOrg)
    const starred = favorites.map((org) => byName.get(org.name) ?? org)
    const starredNames = new Set(favorites.map((org) => org.name))
    return [
      ...starred,
      ...[...byName.values()].filter((org) => !starredNames.has(org.name)),
    ]
  }, [orgs.data, favorites, currentOrg])
  const selected =
    organizations.find((org) => org.name === currentOrg.name) ?? currentOrg

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={t("component.orgSelector.change", [currentOrg.name])}
              title={t("component.orgSelector.change", [currentOrg.name])}
              className={cn(
                "group flex h-9 min-w-0 items-center rounded-lg border border-border bg-background/40 text-sm font-medium outline-none hover:bg-foreground/5 focus-ring aria-expanded:bg-foreground/5",
                // In the sidebar, match menu rows: 24px icon column at the
                // same inset (pl-4 minus the 1px border) and gap-3.
                sidebar
                  ? "w-full gap-3 pr-3 pl-[15px] group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                  : "max-w-44 gap-2 px-3"
              )}
            />
          }
        >
          <OrgIcon
            org={selected}
            className={sidebar ? "size-6 rounded-md text-xs" : "size-5"}
          />
          <span
            className={cn(
              "flex-1 truncate text-left",
              sidebar && "group-data-[collapsible=icon]:hidden"
            )}
          >
            {selected.name}
          </span>
          <CaretDownIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180",
              sidebar && "group-data-[collapsible=icon]:hidden"
            )}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(20rem,calc(100vw-1rem))] gap-0 overflow-hidden p-0"
        >
          <Command
            className="rounded-none"
            label={t("views.channels.sortOptions.org")}
            defaultValue={currentOrg.name}
          >
            <CommandInput
              autoFocus
              placeholder={t("component.orgSelector.search")}
              aria-label={t("component.orgSelector.search")}
            />
            <CommandList>
              <CommandEmpty>
                {t(
                  orgs.isPending
                    ? "component.orgSelector.loading"
                    : "component.orgSelector.noMatch"
                )}
              </CommandEmpty>
              {organizations.map((org) => (
                <CommandItem
                  key={org.name}
                  value={org.name}
                  keywords={[org.name_jp ?? "", orgShortName(org)]}
                  data-checked={org.name === currentOrg.name}
                  onSelect={() => {
                    ;(onSelect ?? setCurrentOrg)({
                      ...org,
                      short: orgShortName(org),
                    })
                    setOpen(false)
                  }}
                >
                  <OrgIcon org={org} />
                  <span className="min-w-0 flex-1 truncate">{org.name}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
          <div className="border-t p-1">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl text-xs text-brand"
              onClick={() => {
                setOpen(false)
                setDialogOpen(true)
              }}
            >
              {t("component.orgSelector.manage")}
            </Button>
            {orgs.isError && (
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => void orgs.refetch()}
              >
                {t("component.apiError.retry")}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <OrgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={onSelect}
      />
    </>
  )
}

export function OrgDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (org: Org) => void
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
    ;(onSelect ?? setCurrentOrg)({ ...org, short: orgShortName(org) })
    onOpenChange(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-4 p-4 sm:max-w-lg sm:p-5">
        <DialogHeader className="px-1">
          <DialogTitle>{t("views.channels.sortOptions.org")}</DialogTitle>
          <DialogDescription>
            {t("component.orgSelector.hint")}
          </DialogDescription>
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
                      aria-label={t("component.orgSelector.moveDown", [
                        org.name,
                      ])}
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
