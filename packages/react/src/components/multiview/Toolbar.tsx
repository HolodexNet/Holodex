import { Selector } from "./Selector";
import { Button } from "@/shadcn/ui/button";
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
    <div className="flex w-full items-center justify-between gap-2 max-w-full flex-nowrap p-1">
      {/* Video selector - constrained width */}
      <div className="min-w-0 overflow-hidden flex-1">
        <Selector />
      </div>

      {/* Toolbar buttons - fixed width */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Edit mode toggle */}
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={toggleEditMode}
          className="gap-1"
        >
          <span className="h-4 w-4 i-lucide:layout-grid" />
          <span className="hidden sm:inline">Edit</span>
        </Button>

        {/* Preset selector with previews */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <span className="h-4 w-4 i-lucide:grid-3x3" />
              <span className="hidden sm:inline">Presets</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-80 w-56 overflow-y-auto"
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
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <span className="h-4 w-4 i-lucide:trash-2" />
          <span className="hidden md:inline">Clear</span>
        </Button>

        {/* Fullscreen */}
        <Button variant="outline" size="sm" onClick={toggleFullScreen}>
          <span className="h-4 w-4 i-lucide:maximize" />
        </Button>
      </div>
    </div>
  );
}
