import React from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/shadcn/ui/menubar";
import { undoActionAtom } from "./hooks/subtitles";

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
    <div className="">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger onClick={onExit}>Exit to Holodex</MenubarTrigger>
        </MenubarMenu>
        {/* <MenubarItem onClick={onExit}>
          {t("component.mainNav.home")}
        </MenubarItem> */}
        <MenubarMenu>
          <MenubarTrigger>{t("views.tlClient.menu.setting")}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Reset Editor / Open a new video</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onSave}>
              {t("views.scriptEditor.menu.save")}
              <MenubarShortcut>Ctrl-S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarLabel className="text-base-10">
              SRT Subtitle File
            </MenubarLabel>
            <MenubarItem>{t("views.scriptEditor.menu.importFile")}</MenubarItem>
            <MenubarItem>{t("views.scriptEditor.menu.exportFile")}</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger disabled={!canUndo} onClick={() => undo()}>
            Undo
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
