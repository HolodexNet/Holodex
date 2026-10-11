import { useEffect } from "react"

export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} - Holodex` : "Holodex"
  }, [title])
}
