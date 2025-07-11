import {
  mdiCardPlusOutline,
  mdiChevronUp,
  mdiContentSaveOutline,
  mdiDeleteOutline,
  mdiFullscreen,
  mdiGridLarge,
  mdiLinkVariant,
  mdiSync,
  mdiTuneVertical,
  mdiViewGridPlusOutline,
} from "@mdi/js";
import { closeMultiViewPanelAtom } from "@/hooks/useFrame";
import { useSetAtom } from "jotai";
import { MultiViewIcon, ToolButton } from "./ToolButton";

const reorderIcon =
  "M2 2h8.8v8.8H2V2Zm11.3 11.3H22V22h-8.8v-8.8Zm4.6-10.9a.6.6 0 0 0-1 0l-3.9 4a.6.6 0 1 0 .9.9l3.5-3.6L21 7.3a.6.6 0 0 0 .8-1l-4-4Zm.1 10V2.8h-1.2v9.6H18ZM5.7 21.6c.3.3.7.3 1 0l3.9-4a.6.6 0 1 0-.9-.9l-3.5 3.6-3.6-3.6a.6.6 0 1 0-.9 1l4 4Zm-.2-10v9.6h1.3v-9.6H5.5Z";

export function ToolButtonContainer() {
  const closePanel = useSetAtom(closeMultiViewPanelAtom);

  const icons: MultiViewIcon[] = [
    {
      path: mdiCardPlusOutline,
      tooltip: "Open Dialog",
    },
    {
      path: mdiGridLarge,
      tooltip: "Change Layout",
    },
    {
      path: mdiViewGridPlusOutline,
      tooltip: "Add Cell",
    },
    {
      path: mdiTuneVertical,
      tooltip: "Media Control",
    },
    {
      path: reorderIcon,
      tooltip: "Reorder Layout",
    },
    {
      path: mdiSync,
      tooltip: "Archive Sync",
    },
    {
      path: mdiContentSaveOutline,
      tooltip: "Save Layout",
    },
    {
      path: mdiDeleteOutline,
      tooltip: "Clear",
    },
    {
      path: mdiFullscreen,
      tooltip: "Fullscreen",
    },
    {
      path: mdiLinkVariant,
      tooltip: "Share Layout",
    },
    {
      path: mdiChevronUp,
      tooltip: "Collapse Panel",
      onClick: closePanel,
    },
  ];

  return (
    <div className="flex flex-row items-center justify-center gap-4 rounded-lg ">
      {icons.map((icon, index) => (
        <ToolButton key={index} icon={icon} index={`${icon.tooltip}-button`} />
      ))}
    </div>
  );
}
