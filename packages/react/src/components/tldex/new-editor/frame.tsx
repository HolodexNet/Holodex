import { Button } from "@/shadcn/ui/button";
import "./frame.css";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ContextMenuShortcut } from "@/shadcn/ui/context-menu";
import { useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import { useEffect } from "react";

export function TLEditorFrame() {
  const { t } = useTranslation();
  const setHeaderHidden = useSetAtom(headerHiddenAtom);
  useEffect(() => {
    setHeaderHidden(true);
    return () => setHeaderHidden(false);
  });

  return (
    <div className="tl-frame inset-0 p-4">
      <div className="">
        <div className="mb-4">
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
              className={cn({ "btn-disabled disabled": !false })}
              // onClick="undo"
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={cn({ "btn-disabled disabled": !false })}
              // onClick="redo"
            >
              Redo
            </Button>
          </div>
        </div>

        <div className="content">
          {/* <!-- Main content goes here --> */}
          {/* <video-player
        ref="player"
        :video="{ id: videoId }"
        :refresh-interval-ms="20"
        className="h-full overflow-hidden rounded-xl"
      /> */}
        </div>

        <div className="sidebar">
          {/* <!-- Sidebar content goes here --> */}
          {/* <editor-sidebar :room-id="roomId" :player="player?.player" /> */}
        </div>

        <div className="tooling">
          {/* <!-- tooling content goes here --> */}
          {/* tooling { room?.messages.length } */}
        </div>

        <div className="waveform">
          {/* <!-- waveform content goes here --> */}
          {/* <Waveform
        :video-id="videoId"
        :room="room"
        :player="player"
        @sort-messages="chatDB.sortRoom(roomId)"
      /> */}
        </div>
      </div>
    </div>
  );
}
