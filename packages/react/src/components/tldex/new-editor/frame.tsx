import React, { useCallback, useEffect, useState } from "react";
import "./frame.css";
import {
  useBeforeUnload,
  useBlocker,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useVideo } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { ContextMenuShortcut } from "@/shadcn/ui/context-menu";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import SubtitleTimeline from "./components/SubtitleTimeline";
import { useChatDB } from "@/hooks/useChatDB";
import { useSubtitles } from "./hooks/subtitles";
import { WaveformEditor } from "./components/WaveformEditor";
import { WaveformLoadingButton } from "./WaveformLoadingButton";
import { Menubar } from "@/shadcn/ui/menubar";
import { VideoIdInput } from "./VideoIdInput";

export function TLEditorFrame() {
  const { id } = useVideoData();
  const makeHeaderHide = useSetAtom(headerHiddenAtom);
  const { messages, loadMessages } = useChatDB(
    id ? `${id}/en` : "not_a_room/en",
  );
  const { subtitles, updateSubtitles } = useSubtitles();
  const [isBlocking, setIsBlocking] = useState(false); // navigation-away blocker
  const navigate = useNavigate();

  useEffect(() => {
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
  }, [makeHeaderHide]);

  useEffect(() => {
    if (id && !isBlocking && !messages?.length) {
      loadMessages({ partial: 100000 });
      setIsBlocking(true); // Start blocking navigation once we have loaded data
    }
  }, [id, loadMessages, isBlocking, messages]);

  useEffect(() => {
    if (messages && messages.length > 0 && !subtitles.length) {
      updateSubtitles(messages);
    }
  }, [messages, updateSubtitles, subtitles]);

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
        <TLEditorContent />
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
      <Button size="sm" variant="outline" className="min-w-16 px-2">
        Undo
      </Button>
      <Button size="sm" variant="outline" className="min-w-16 px-2">
        Redo
      </Button>
    </div>
  );
}

// TLEditorContent.tsx
export function TLEditorContent() {
  const { currentVideo } = useVideoData();

  if (!currentVideo) {
    return <VideoIdInput />;
  }

  return (
    <>
      <PanelGroup direction="horizontal" className="content">
        <Panel defaultSize={60} minSize={40}>
          <div className="flex size-full flex-col">
            <div className="flex-1 overflow-hidden rounded">
              <PlayerWrapper
                id={currentVideo.id || "x"}
                url={idToVideoURL(currentVideo.id || "x")}
              />
            </div>
            <div className="h-[60px]">
              <Menubar>
                <WaveformLoadingButton videoId={currentVideo.id} />
              </Menubar>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 hover:bg-base-4" />
        <Panel defaultSize={40} minSize={20}>
          <SubtitleTimeline />
        </Panel>
      </PanelGroup>
      <WaveformEditor videoId={currentVideo.id} />
    </>
  );
}

// useVideoData.ts
function useVideoData() {
  const [urlSearchParams] = useSearchParams();
  const id = urlSearchParams.get("id");
  const {
    data: currentVideo,
    error,
    isPending,
    isSuccess,
  } = useVideo({ id: id || "" }, { enabled: !!id });

  return { id, currentVideo, error, isPending, isSuccess };
}
