import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { cn } from "cn"

import { StarIcon } from "@/components/icons"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useT } from "@/lib/i18n"
import { isMusicPath } from "@/lib/music-route"
import { useOrgs } from "@/lib/queries"
import type { Org } from "@/lib/types"
import { useOrgStore } from "@/stores/org"
import { TAB_BY_HASH } from "./home-tabs-layout"
import { OrgDialog, OrgIcon, OrgSelector, orgShortName } from "./org-selector"

/** The rewrite's organization navigation, using attempt-3's feed and theme. */
export function OrgSidebar() {
  const { t } = useT()
  const location = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile } = useSidebar()
  const orgs = useOrgs()
  const currentOrg = useOrgStore((s) => s.currentOrg)
  const favorites = useOrgStore((s) => s.orgFavorites)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const [manageOpen, setManageOpen] = useState(false)
  const music = isMusicPath(location.pathname)
  // Organization links keep the current home tab when switching orgs.
  const hash =
    ["/", "/favorites"].includes(location.pathname) &&
    TAB_BY_HASH[location.hash]
      ? location.hash
      : ""
  const to = music ? "/#music" : `/${hash}`
  const select = (org: Org) => {
    setCurrentOrg({ ...org, short: orgShortName(org) })
    navigate(to)
    setOpenMobile(false)
  }

  return (
    <>
      <SidebarHeader className="pb-1">
        <OrgSelector sidebar onSelect={select} />
      </SidebarHeader>
      <SidebarGroup className="pt-1">
        <SidebarGroupContent>
          <SidebarMenu className="mt-1">
            {favorites.map((favorite) => {
              const org =
                orgs.data?.find((org) => org.name === favorite.name) ?? favorite
              const active =
                location.pathname === "/" && currentOrg.name === org.name
              return (
                <SidebarMenuItem key={org.name}>
                  <SidebarMenuButton
                    isActive={active}
                    aria-current={active ? "page" : undefined}
                    tooltip={org.name}
                    className={cn(
                      "h-10 gap-2.5 group-data-[collapsible=icon]:p-1!",
                      active && "bg-primary/10! text-brand!"
                    )}
                    render={
                      <Link
                        to={to}
                        onClick={() => {
                          setCurrentOrg({ ...org, short: orgShortName(org) })
                          setOpenMobile(false)
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                      />
                    }
                  >
                    <OrgIcon
                      org={org}
                      className="size-6 rounded-md bg-background/60 text-xs"
                    />
                    <span>{org.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip={t("component.orgSelector.manage")}
                className="mt-1 text-muted-foreground"
                onClick={() => setManageOpen(true)}
              >
                <StarIcon />
                <span>{t("component.orgSelector.manage")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <OrgDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        onSelect={select}
      />
    </>
  )
}
