import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { User } from "@/lib/types"
import { readLegacyState } from "./legacy"
import { syncAcrossTabs } from "./sync"

interface AuthStore {
  user: User | null
  jwt: string | null
  setSession: (session: { user: User; jwt: string }) => void
  setUser: (user: User) => void
  logout: () => void
}

/** Seconds until the token expires, or 0 when it cannot be read. */
function secondsLeft(jwt: string): number {
  try {
    const payload = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return exp ? exp - Date.now() / 1000 : 0
  } catch {
    return 0
  }
}

function initial(): Pick<AuthStore, "user" | "jwt"> {
  const legacy = readLegacyState()?.userdata
  if (legacy?.user && legacy.jwt && secondsLeft(legacy.jwt) > 0) {
    return { user: legacy.user, jwt: legacy.jwt }
  }
  return { user: null, jwt: null }
}

/** Musicdex and the browser extension read the session from this cookie. */
function setJwtCookie(jwt: string | null) {
  const domain = window.location.hostname.endsWith("holodex.net")
    ? ";domain=.holodex.net"
    : ""
  document.cookie = jwt
    ? `HOLODEX_JWT=${jwt};path=/;max-age=${Math.floor(secondsLeft(jwt))}${domain}`
    : `HOLODEX_JWT=;path=/;max-age=0${domain}`
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      ...initial(),
      setSession: ({ user, jwt }) => {
        setJwtCookie(jwt)
        set({ user, jwt })
      },
      setUser: (user) => set({ user }),
      logout: () => {
        setJwtCookie(null)
        set({ user: null, jwt: null })
      },
    }),
    {
      name: "holodex-v3/auth",
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state?.jwt && secondsLeft(state.jwt) <= 0) state.logout()
      },
    }
  )
)

syncAcrossTabs(useAuth)

export const getJwt = () => useAuth.getState().jwt
