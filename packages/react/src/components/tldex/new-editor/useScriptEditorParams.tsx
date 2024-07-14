import { useSearchParams } from "react-router-dom";
import { useVideo } from "@/services/video.service";

// useScriptEditorParams.ts
export function useScriptEditorParams() {
  const [urlSearchParams] = useSearchParams();
  const id = urlSearchParams.get("id");
  const editorLanguage = urlSearchParams.get("tleditor-language");
  const creditName = urlSearchParams.get("caption-by");
  const {
    data: currentVideo,
    error,
    isPending,
    isSuccess,
  } = useVideo({ id: id || "" }, { enabled: !!id });

  return {
    id,
    currentVideo,
    error,
    isPending,
    isSuccess,
    editorLanguage,
    creditName,
  };
}
