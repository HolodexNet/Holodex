import React, { useCallback, useEffect, useState } from "react";
import "./TLEditorFrame.css";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import SubtitleList from "./components/SubtitleList";
import { WaveformEditor } from "./components/WaveformEditor";
import { WaveformLoadingButton } from "./WaveformLoadingButton";
import { Menubar } from "@/shadcn/ui/menubar";
import { VideoIdInput } from "./VideoIdInput";
import { useScriptEditorParams } from "./useScriptEditorParams";
import { Loading } from "@/components/common/Loading";
import { clientAtom } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import { getSubtitlesForVideo, subtitleManagerAtom } from "./hooks/subtitles";
import { TLEditorHeader } from "./TLEditorHeader";
import { useNavBlocker } from "@/hooks/useBlock";
import { playerRefAtom } from "@/store/player";

export function TLEditorFrame() {
  const {
    id,
    currentVideo,
    isPending: isVideoPending, // download progress pending
    editorLanguage,
  } = useScriptEditorParams();
  const makeHeaderHide = useSetAtom(headerHiddenAtom);
  const [isBlocking, setIsBlocking] = useState(false); // navigation-away blocker
  const client = useAtomValue(clientAtom);
  const navigate = useNavigate();
  const subtitleDispatch = useSetAtom(subtitleManagerAtom);

  useEffect(() => {
    // hides the holodex default header
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isSuccess,
    data: script,
    isLoading: isScriptLoading,
  } = useQuery({
    queryKey: ["script", id, editorLanguage],
    queryFn: async () => {
      return getSubtitlesForVideo(client, id!, editorLanguage!);
    },
    enabled: !!id && !!editorLanguage,
    refetchInterval: false,
  });

  useEffect(() => {
    if (isSuccess) {
      console.log("Subtitles loaded:", script);
      subtitleDispatch({ type: "SET_SUBTITLES", payload: script });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, script]);

  // Prevent soft navigation within the SPA
  useNavBlocker({
    enabled: isBlocking,
    onBlock(control) {
      const proceed = window.confirm(
        "Are you sure you want to leave? You may lose unsaved changes.",
      );
      if (proceed) {
        control.confirm();
      } else {
        control.cancel();
      }
    },
  });

  // Prevent hard refresh and closing tab
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isBlocking) {
        event.preventDefault();
        event.returnValue = "You may lose unsaved changes if you leave.";
      }
    },
    [isBlocking],
  );

  useBeforeUnload(handleBeforeUnload);

  const handleSave = useCallback(() => {
    // Implement your save logic here
    console.log("Saving...");
    // After successful save:
    setIsBlocking(false);
  }, []);

  const handleExit = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to exit? You may lose unsaved changes.",
      )
    ) {
      setIsBlocking(false);
      navigate("/"); // Navigate to home or any other appropriate route
    }
  }, [navigate]);

  return (
    // <div className="h-full w-full">
    <div className="tl-frame p-4">
      <TLEditorHeader onSave={handleSave} onExit={handleExit} />
      {!id && !currentVideo && <VideoIdInput />}
      {id && (isVideoPending || isScriptLoading) && <Loading size="md" />}
      {id && currentVideo && <TLEditorContent />}
    </div>
    // </div>
  );
}
// TLEditorContent.tsx
export function TLEditorContent() {
  const { id } = useScriptEditorParams();
  const setPlayerRef = useSetAtom(playerRefAtom);
  return (
    <>
      <PanelGroup direction="horizontal" className="content">
        <Panel defaultSize={60} minSize={40}>
          <div className="flex size-full flex-col">
            <div className="flex-1 overflow-hidden rounded">
              <PlayerWrapper
                id={id || "x"}
                customSetPlayerRef={setPlayerRef}
                url={idToVideoURL(id || "x")}
              />
            </div>
            <div className="h-[60px]">
              <Menubar>
                <WaveformLoadingButton videoId={id!} />
              </Menubar>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 hover:bg-base-4" />
        <Panel defaultSize={40} minSize={20}>
          <SubtitleList />
        </Panel>
      </PanelGroup>
      <WaveformEditor videoId={id!} />
    </>
  );
}
