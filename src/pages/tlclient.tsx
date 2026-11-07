import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router"

import { TlSetup } from "@/components/tlclient/setup"
import { TlWorkspace } from "@/components/tlclient/workspace"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useT } from "@/lib/i18n"
import {
  readSessionParams,
  writeSessionParams,
  type SessionParams,
} from "@/lib/tlclient/session"
import { useMusicPlayer } from "@/stores/music-player"

/**
 * A full window for translating a stream live. The session lives in the
 * address (`?video=…&collab=…&lang=…`), as links from the old UI expect.
 */
export default function TlClientPage() {
  const { t } = useT()
  const [search, setSearch] = useSearchParams()
  const key = search.toString()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content
  const params = useMemo(() => readSessionParams(search), [key])
  useDocumentTitle(t("tlClient.title"))

  // The stream's audio is what is being translated; nothing should play over it.
  useEffect(() => {
    useMusicPlayer.getState().pause()
    const root = document.documentElement
    root.dataset.fullWindow = ""
    return () => {
      delete root.dataset.fullWindow
    }
  }, [])

  const update = (next: SessionParams) => {
    // Starting or leaving a session is a step Back can undo; changes within
    // one (language, collab streams) just update the address.
    const replace = !!params.main && !!next.main
    setSearch(writeSessionParams(next), { replace })
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {params.main ? (
        <TlWorkspace
          key={params.main}
          params={params}
          onParamsChange={update}
        />
      ) : (
        <TlSetup initialLang={params.lang} onStart={update} />
      )}
    </div>
  )
}
