import React, { useCallback, useEffect, useState } from "react";
import "./frame.css";
import WaveformEditor from "./components/WaveformEditor";
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
import { idToVideoURL, videoURLtoID } from "@/lib/utils";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { headerHiddenAtom } from "@/hooks/useFrame";
import SubtitleTimeline from "./components/SubtitleTimeline";
import { useChatDB } from "@/hooks/useChatDB";
import { useSubtitles } from "./hooks/subtitles";

export function TLEditorFrame() {
  const { id, currentVideo } = useVideoData();
  const makeHeaderHide = useSetAtom(headerHiddenAtom);
  const { messages, loadMessages } = useChatDB(
    id ? `${id}/en` : "not_a_room/en",
  );
  const { updateSubtitles } = useSubtitles();
  const [isBlocking, setIsBlocking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
  }, [makeHeaderHide]);

  useEffect(() => {
    if (id) {
      loadMessages({ partial: 100000 });
      setIsBlocking(true); // Start blocking navigation once we have loaded data
    }
  }, [id, loadMessages]);

  useEffect(() => {
    if (messages) {
      updateSubtitles(messages);
    }
  }, [messages, updateSubtitles]);

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
        <TLEditorHeader /* onSave={handleSave} onExit={handleExit} */ />
        <TLEditorContent videoId={id || ""} />
        {id && <WaveformEditor videoId={id} />}
      </div>
    </div>
  );
}
// TLEditorHeader.tsx
export function TLEditorHeader() {
  const { t } = useTranslation();

  return (
    <div className="tl-topbar">
      <Button size="sm" className="min-w-16 px-2">
        {t("component.mainNav.home")}
      </Button>
      <Button variant="secondary" size="sm" className="px-2">
        {t("views.tlClient.menu.setting")}
      </Button>
      <Button size="sm" variant="secondary" className="px-2">
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
export function TLEditorContent({ videoId }: { videoId?: string }) {
  const { currentVideo } = useVideoData();

  if (!currentVideo) {
    return <VideoIdInput />;
  }

  return (
    <PanelGroup direction="horizontal" className="content">
      <Panel defaultSize={60} minSize={40}>
        <div className="flex size-full flex-col">
          <div className="flex-1 overflow-hidden rounded">
            <PlayerWrapper
              id={currentVideo.id || "x"}
              url={idToVideoURL(currentVideo.id || "x")}
            />
          </div>
          <div className="h-[60px]">Tooling</div>
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 hover:bg-base-4" />
      <Panel defaultSize={40} minSize={20}>
        <SubtitleTimeline />
      </Panel>
    </PanelGroup>
  );
}

// VideoIdInput.tsx
function VideoIdInput() {
  const [urlField, setUrlField] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = videoURLtoID(urlField);
    if (!id) {
      alert("Invalid video URL [" + id + "]");
      return;
    }
    navigate("?id=" + id);
  };

  return (
    <div className="content">
      <Label htmlFor="videoId" className="text-base-11">
        Put in a video ID
      </Label>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm items-center space-x-2"
      >
        <Input
          id="videoId"
          value={urlField}
          onInput={(e) => setUrlField(e.currentTarget.value)}
        />
        <Button type="submit">Load</Button>
      </form>
    </div>
  );
}

// VideoStatus.tsx
function VideoStatus({ videoId }: { videoId?: string }) {
  const videoStatusAtom = videoStatusAtomFamily(videoId || "x");
  const videoStatus = useAtomValue(videoStatusAtom);

  return (
    <span className="content w-full text-wrap text-base-11">
      {JSON.stringify(videoStatus, null, 2)}
    </span>
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
