import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { userAvatar } from "@/components/layout/user-menu"
import { LogoDiscordIcon, SignOutIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api } from "@/lib/api"
import { getT, useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import { useResolvedMode } from "@/lib/theme/use-theme"
import { useAuth } from "@/stores/auth"

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client"
const GOOGLE_CLIENT_ID =
  "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com"
const DISCORD_CLIENT_ID = "793619250115379262"

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        callback: (response: { credential: string }) => void
      }) => void
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

let googleScript: Promise<void> | undefined

function loadGoogleScript(): Promise<void> {
  googleScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = GOOGLE_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      googleScript = undefined
      reject(new Error("Google sign-in failed to load"))
    }
    document.head.appendChild(script)
  })
  return googleScript
}

type Service = "google" | "discord" | "twitter"

/**
 * Reads the token a provider sent the browser back with: Discord puts its
 * access token in the URL hash, Twitter a short-lived token in the query.
 */
function readProviderReturn(): { service: Service; token: string } | null {
  const query = new URLSearchParams(window.location.search)
  const service = query.get("service")
  if (service === "discord") {
    const token = new URLSearchParams(window.location.hash.slice(1)).get(
      "access_token"
    )
    return token ? { service, token } : null
  }
  if (service === "twitter") {
    const token = query.get("jwt")
    return token ? { service, token } : null
  }
  return null
}

function GoogleButton({ onCredential }: { onCredential: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const mode = useResolvedMode()
  const callback = useRef(onCredential)

  useEffect(() => {
    callback.current = onCredential
  })

  useEffect(() => {
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        const el = ref.current
        if (cancelled || !el || !window.google) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => callback.current(credential),
        })
        window.google.accounts.id.renderButton(el, {
          theme: mode === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          width: Math.min(el.clientWidth, 400),
          logo_alignment: "left",
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [mode])

  return <div ref={ref} className="flex min-h-11 w-full justify-center" />
}

export function LoginPage() {
  const { t, tl } = useT()
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const setSession = useAuth((s) => s.setSession)
  const logout = useAuth((s) => s.logout)
  const [returned] = useState(readProviderReturn)
  const [busy, setBusy] = useState(returned !== null)
  const loginWith = tl("views.login.with")

  useDocumentTitle(t("component.mainNav.login"))

  const exchange = async (service: Service, token: string) => {
    setBusy(true)
    try {
      // Sent with the current session (if any), this links the provider to it.
      setSession(await api.login(service, token))
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
    } catch {
      toast.error(t("views.login.failed"))
    } finally {
      setBusy(false)
    }
  }

  // Finish a sign-in we were sent back from (see readProviderReturn).
  useEffect(() => {
    if (!returned) return
    void navigate("/login", { replace: true })
    api
      .login(returned.service, returned.token)
      .then((session) => {
        setSession(session)
        void queryClient.invalidateQueries({ queryKey: ["favorites"] })
      })
      .catch(() => toast.error(getT().t("views.login.failed")))
      .finally(() => setBusy(false))
  }, [returned, navigate, setSession])

  const loginDiscord = () => {
    const redirect = `${window.location.origin}/login?service=discord`
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: redirect,
      response_type: "token",
      scope: "identify",
    })
    window.location.assign(`https://discord.com/api/oauth2/authorize?${params}`)
  }

  const signOut = () => {
    logout()
    queryClient.removeQueries({ queryKey: ["favorites"] })
    queryClient.removeQueries({ queryKey: ["live", "favorites"] })
  }

  const linked = [
    { name: "Google", on: !!user?.google_id },
    { name: "Discord", on: !!user?.discord_id },
    { name: "Twitter", on: !!user?.twitter_id },
  ]

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      {user ? (
        <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <img
              src={userAvatar(user.id)}
              alt=""
              className="size-14 rounded-full bg-muted"
            />
            <div className="min-w-0">
              <div className="truncate text-lg font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                <span className="capitalize">{user.role}</span> ·{" "}
                {Number(user.contribution_count) || 0}{" "}
                {t("component.mainNav.points")}
              </div>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2 text-xs">
            {linked.map((service) => (
              <li
                key={service.name}
                className={
                  service.on
                    ? "rounded-full bg-secondary px-2.5 py-1 font-medium"
                    : "rounded-full border px-2.5 py-1 text-muted-foreground"
                }
              >
                {service.name}
                {service.on ? " ✓" : ""}
              </li>
            ))}
          </ul>
          <Button variant="outline" onClick={signOut}>
            <SignOutIcon data-icon="inline-start" />
            {t("component.mainNav.logout")}
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-medium tracking-tight">
            {t("component.mainNav.login")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("views.favorites.promptForAction")}
          </p>
        </div>
      )}

      {(!user || !user.google_id || !user.discord_id) && (
        <div className="flex flex-col items-center gap-3">
          {user && (
            <p className="text-sm text-muted-foreground">
              {t("views.login.linkAcc")}
            </p>
          )}
          {busy ? (
            <Spinner className="size-6" />
          ) : (
            <>
              {!user?.google_id && (
                <GoogleButton onCredential={(token) => exchange("google", token)} />
              )}
              {!user?.discord_id && (
                <Button
                  size="lg"
                  className="w-full max-w-[400px] bg-[#5865F2] text-white hover:bg-[#4752c4]"
                  onClick={loginDiscord}
                >
                  <LogoDiscordIcon data-icon="inline-start" />
                  {loginWith[1] ?? "Login with Discord"}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
