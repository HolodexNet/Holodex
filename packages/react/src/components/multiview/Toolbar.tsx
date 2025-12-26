import { Selector } from "./Selector";
import { editModeAtom } from "@/store/multiview";
import { useAtom } from "jotai";
import { useAutoLayout } from "@/hooks/useAutoLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shadcn/ui/dropdown-menu";
import {
  horizontalPresets,
  squarePresets,
  verticalPresets,
} from "@/lib/multiview-utils";
import { PresetPreview } from "./PresetPreview";

export function Toolbar() {
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const { clearAll, applyPreset } = useAutoLayout();

  const toggleEditMode = () => setEditMode((prev) => !prev);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-2 max-w-full p-1 flex-nowrap">
      {/* Video selector - constrained width */}
      <div className="min-w-0 overflow-hidden px-1 flex-1">
        <Selector />
      </div>

      {/* Toolbar buttons - fixed width, icon-centric with small labels */}
      <div className="flex shrink-0 items-center gap-0.5">
        {/* Edit mode toggle */}
        <button
          onClick={toggleEditMode}
          className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-md transition-colors ${
            editMode
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/50"
          }`}
        >
          <span className="h-5 w-5 i-lucide:layout-grid" />
          <span className="mt-0.5 leading-none text-[9px]">Edit</span>
        </button>

        {/* Preset selector with previews */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center rounded-md transition-colors justify-center py-1 px-2.5 text-muted-foreground/70 hover:text-foreground hover:bg-accent/50">
              <span className="h-5 w-5 i-lucide:grid-3x3" />
              <span className="text-[9px] mt-0.5 leading-none">Presets</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 overflow-y-auto max-h-80"
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Horizontal (12×20)
            </DropdownMenuLabel>
            {horizontalPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.layout}
                onClick={() => applyPreset(preset.layout)}
                className="flex items-center gap-2"
              >
                <PresetPreview layout={preset.layout} gridSize={28} />
                <span className="flex-1 truncate">{preset.name}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Square (12×12)
            </DropdownMenuLabel>
            {squarePresets.map((preset) => (
              <DropdownMenuItem
                key={preset.layout}
                onClick={() => applyPreset(preset.layout)}
                className="flex items-center gap-2"
              >
                <PresetPreview layout={preset.layout} gridSize={28} />
                <span className="flex-1 truncate">{preset.name}</span>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Vertical (20×12)
            </DropdownMenuLabel>
            {verticalPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.layout}
                onClick={() => applyPreset(preset.layout)}
                className="flex items-center gap-2"
              >
                <PresetPreview layout={preset.layout} gridSize={28} />
                <span className="flex-1 truncate">{preset.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear all */}
        <button
          onClick={clearAll}
          className="flex flex-col items-center justify-center px-2.5 py-1 rounded-md text-muted-foreground/70 transition-colors hover:text-destructive hover:bg-destructive/10"
        >
          <span className="h-5 w-5 i-lucide:trash-2" />
          <span className="text-[9px] mt-0.5 leading-none">Clear</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullScreen}
          className="flex flex-col items-center justify-center px-2.5 py-1 rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <span className="h-5 w-5 i-lucide:maximize" />
          <span className="text-[9px] mt-0.5 leading-none">Fullscreen</span>
        </button>
      </div>
    </div>
  );
}
