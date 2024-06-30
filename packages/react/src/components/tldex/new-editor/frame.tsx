import { Button } from "@/shadcn/ui/button";
import "./frame.css";
import { idToVideoURL } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ContextMenuShortcut } from "@/shadcn/ui/context-menu";
import { useAtomValue, useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { videoStatusAtomFamily } from "@/store/player";
import { useNavigate } from "react-router-dom";
import { useVideo } from "@/services/video.service";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { useSearchParam } from "react-use";
import WaveformEditor from "./components/WaveformEditor";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

export function TLEditorFrame() {
  const id = useSearchParam("id");
  const { t } = useTranslation();
  const [urlField, setUrlField] = useState<string>("");
  // const currentVideo = useAtomValue(miniplayerVideoAtom);
  // const setCurrentVideo = useSetAtom(miniplayerVideoAtom);
  const {
    data: currentVideo,
    error,
    isPending,
    isSuccess,
  } = useVideo({ id: id! }, { enabled: !!id });
  const navigate = useNavigate();

  const setHeaderHidden = useSetAtom(headerHiddenAtom);

  useEffect(() => {
    setHeaderHidden(true);
    return () => setHeaderHidden(false);
  });

  return (
    <div className="absolute h-full w-full">
      <div className="tl-frame inset-0 p-4">
        <div className="tl-topbar">
          <Button size="sm" className="min-w-16 px-2">
            {t("component.mainNav.home")}
          </Button>
          {/* <div className="h-6 w-2 bg-primary opacity-60" /> */}
          <Button variant="secondary" size="sm" className="px-2">
            {t("views.tlClient.menu.setting")}
          </Button>
          {/* <div className="h-6 w-2 bg-primary opacity-60" /> */}
          <Button size="sm" variant="secondary" className="px-2">
            {t("views.scriptEditor.menu.save")}
            <ContextMenuShortcut className="text-secondaryA-11">
              Ctrl+S
            </ContextMenuShortcut>
          </Button>

          {/* 
            <!-- <Button size="sm" onClick="console.log('show')">
              { t("views.tlClient.menu.loadVideo") }
            </Button>
            <Button size="sm" onClick="console.log('hide')">
              { t("views.tlClient.menu.unloadVideo") }
            </Button> --> */}
          {/* <div className="h-6 w-2 bg-primary opacity-60" /> */}
          <Button size="sm" className="min-w-16 px-2">
            {t("views.scriptEditor.menu.importFile")}
          </Button>
          <Button size="sm" className="min-w-16 px-2">
            {t("views.scriptEditor.menu.exportFile")}
          </Button>
          {/* <div className="h-6 w-2 bg-primary opacity-60" /> */}

          <Button
            size="sm"
            variant="outline"
            className={clsx("min-w-16 px-2", {
              "btn-disabled disabled": !false,
            })}
            // onClick="undo"
          >
            Undo
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={clsx("min-w-16 px-2", {
              "btn-disabled disabled": !false,
            })}
            // onClick="redo"
          >
            Redo
          </Button>
        </div>

        {currentVideo && (
          <TLEditorBody currentVideo={currentVideo}></TLEditorBody>
        )}
        {!currentVideo && (
          <div className="content">
            <Label htmlFor="videoId" className="text-base-11">
              Put in a video ID
            </Label>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-sm items-center space-x-2"
            >
              <Input
                id="videoId"
                value={urlField}
                onInput={(e) => setUrlField(e.currentTarget.value)}
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("?id=" + urlField);
                }}
              ></Input>
              <Button className="" onClick={() => navigate("?id=" + urlField)}>
                Load
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function TLEditorBody({ currentVideo }: { currentVideo: Video }) {
  const videoStatusAtom = videoStatusAtomFamily(currentVideo?.id || "x");
  const videoStatus = useAtomValue(videoStatusAtom);
  return (
    <>
      <PanelGroup direction="horizontal" className="content">
        <Panel defaultSize={60} minSize={40}>
          <div className="flex size-full flex-col">
            <div className="flex-1 overflow-hidden rounded">
              <PlayerWrapper
                id={currentVideo?.id || "x"}
                url={idToVideoURL(currentVideo?.id || "x")}
              />
            </div>
            <div className="h-[60px]">Tooling</div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 hover:bg-base-4" />
        <Panel defaultSize={40} minSize={20}>
          {JSON.stringify(videoStatus)}
        </Panel>
      </PanelGroup>

      <div className="waveform">
        <WaveformEditor videoId={currentVideo?.id || "x"} />
      </div>
    </>
  );
}
