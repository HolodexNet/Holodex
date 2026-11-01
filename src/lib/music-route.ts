/** Music has its own search and mobile navigation, including channel tabs. */
export function isMusicPath(pathname: string): boolean {
  return (
    pathname === "/music" ||
    pathname.startsWith("/music/") ||
    /^\/channel\/[^/]+\/music\/?$/.test(pathname)
  )
}
