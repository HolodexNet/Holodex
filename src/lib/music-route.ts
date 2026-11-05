const MUSIC_TAB_HASHES = ["#music", "#radio", "#playlists"]

/** The home page's Musicdex tabs, on either the home or favorites path. */
export function isMusicTabHash(hash: string): boolean {
  return MUSIC_TAB_HASHES.includes(hash)
}

/**
 * Pages outside the home tabs that have their own mobile navigation, including
 * channel tabs. Organization links rely on this to keep the current home tab.
 */
export function isMusicPath(pathname: string): boolean {
  return (
    pathname === "/music" ||
    pathname.startsWith("/music/") ||
    /^\/channel\/[^/]+\/music\/?$/.test(pathname)
  )
}

/** Anywhere the viewer is in Musicdex, which is what decides the search type. */
export function isMusicLocation({
  pathname,
  hash,
}: {
  pathname: string
  hash: string
}): boolean {
  return (
    isMusicPath(pathname) ||
    (/^\/(favorites\/?)?$/.test(pathname) && isMusicTabHash(hash))
  )
}
