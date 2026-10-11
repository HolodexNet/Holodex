import { Link, useNavigate } from "react-router"

import {
  GearSixIcon,
  MonitorIcon,
  MoonIcon,
  SignInIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
  UserIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import { useAuth } from "@/stores/auth"
import { useSettings, type ThemeMode } from "@/stores/settings"

/** Generated avatar; Holodex accounts have no profile picture of their own. */
export const userAvatar = (id: string | number) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${id}`

export function UserMenu() {
  const { t } = useT()
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const themeMode = useSettings((s) => s.themeMode)
  const setSetting = useSettings((s) => s.set)

  const signOut = () => {
    logout()
    queryClient.removeQueries({ queryKey: ["favorites"] })
    queryClient.removeQueries({ queryKey: ["live", "favorites"] })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={t("component.mainNav.accountSettings")}
          />
        }
      >
        {user ? (
          <img
            src={userAvatar(user.id)}
            alt=""
            className="size-7 rounded-full bg-muted"
          />
        ) : (
          <UserCircleIcon className="size-6" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-60">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src={userAvatar(user.id)}
                alt=""
                className="size-9 rounded-full bg-muted"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {user.username}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user.role !== "user" && (
                    <span className="capitalize">{user.role} · </span>
                  )}
                  {Number(user.contribution_count) || 0}{" "}
                  {t("component.mainNav.points")}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/login")}>
              <UserIcon />
              {t("component.mainNav.accountSettings")}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem render={<Link to="/login" />}>
            <SignInIcon />
            {t("component.mainNav.login")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link to="/settings" />}>
          <GearSixIcon />
          {t("component.mainNav.settings")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("views.settings.theme")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={themeMode}
            onValueChange={(value) => setSetting("themeMode", value as ThemeMode)}
          >
            <DropdownMenuRadioItem value="light" closeOnClick={false}>
              <SunIcon />
              {t("views.settings.themeLight")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" closeOnClick={false}>
              <MoonIcon />
              {t("views.settings.themeDark")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" closeOnClick={false}>
              <MonitorIcon />
              {t("views.settings.themeSystem")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>

        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <SignOutIcon />
              {t("component.mainNav.logout")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
