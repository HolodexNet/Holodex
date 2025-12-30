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
import { useAutoLayout } from "@/hooks/useAutoLayout";

interface PresetMenuProps {
  children: React.ReactNode;
}

export function PresetMenu({ children }: PresetMenuProps) {
  const { applyPreset } = useAutoLayout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
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
  );
}
