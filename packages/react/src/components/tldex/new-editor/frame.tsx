import React, { useCallback, useEffect, useState } from "react";
import "./frame.css";
import { useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { ContextMenuShortcut } from "@/shadcn/ui/context-menu";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import SubtitleTimeline from "./components/SubtitleTimeline";
import { WaveformEditor } from "./components/WaveformEditor";
import { WaveformLoadingButton } from "./WaveformLoadingButton";
import { Menubar } from "@/shadcn/ui/menubar";
import { VideoIdInput } from "./VideoIdInput";
import clsx from "clsx";
import { useScriptEditorParams } from "./useScriptEditorParams";
import { Loading } from "@/components/common/Loading";
import { clientAtom } from "@/hooks/useClient";
import { useQuery } from "@tanstack/react-query";
import {
  getSubtitlesForVideo,
  subtitleManagerAtom,
  undoActionAtom,
} from "./hooks/subtitles";

export function TLEditorFrame() {
  const {
    id,
    currentVideo,
    isPending: isVideoPending,
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
      subtitleDispatch({ type: "ADD_SUBTITLES", payload: script });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, script]);

  // Prevent soft navigation within the SPA
  const blocker = useBlocker(isBlocking);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const proceed = window.confirm(
        "Are you sure you want to leave? You may lose unsaved changes.",
      );
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

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
    <div className="absolute h-full w-full">
      <div className="tl-frame inset-0 p-4">
        <TLEditorHeader onSave={handleSave} onExit={handleExit} />
        {!id && !currentVideo && <VideoIdInput />}
        {id && (isVideoPending || isScriptLoading) && <Loading size="md" />}
        {id && currentVideo && <TLEditorContent />}
      </div>
    </div>
  );
}
// TLEditorHeader.tsx
export function TLEditorHeader({
  onSave,
  onExit,
}: {
  onSave: () => void;
  onExit: () => void;
}) {
  const { t } = useTranslation();
  const [canUndo, undo] = useAtom(undoActionAtom);

  return (
    <div className="tl-topbar">
      <Button size="sm" className="min-w-16 px-2" onClick={onExit}>
        {t("component.mainNav.home")}
      </Button>
      <Button variant="secondary" size="sm" className="px-2">
        {t("views.tlClient.menu.setting")}
      </Button>
      <Button size="sm" variant="secondary" className="px-2" onClick={onSave}>
        {t("views.scriptEditor.menu.save")}
        <ContextMenuShortcut className="text-secondaryA-11">
          Ctrl+S
        </ContextMenuShortcut>
      </Button>
      <Button size="sm" className="min-w-16 px-2">
        {t("views.scriptEditor.menu.importFile")}
      </Button>
      <Button size="sm" className="min-w-16 px-2">
        {t("views.scriptEditor.menu.exportFile")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={clsx(
          "min-w-16 px-2",
          canUndo && "text-primary-11",
          !canUndo && "text-secondary-11",
        )}
        onClick={() => undo()}
      >
        Undo
      </Button>
      {/* <Button
        size="sm"
        variant="outline"
        className={clsx(
          "min-w-16 px-2",
          canRedo && "text-primary-11",
          !canRedo && "text-secondary-11",
        )}
        onClick={() => redo()}
      >
        Redo
      </Button> */}
    </div>
  );
}

// TLEditorContent.tsx
export function TLEditorContent() {
  const { currentVideo, id } = useScriptEditorParams();

  return (
    <>
      <PanelGroup direction="horizontal" className="content">
        <Panel defaultSize={60} minSize={40}>
          <div className="flex size-full flex-col">
            <div className="flex-1 overflow-hidden rounded">
              <PlayerWrapper id={id || "x"} url={idToVideoURL(id || "x")} />
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
          <SubtitleTimeline />
        </Panel>
      </PanelGroup>
      <WaveformEditor videoId={id!} />
    </>
  );
}
