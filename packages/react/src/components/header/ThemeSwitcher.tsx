import { Button } from "@/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { useEffect } from "react";
import { useAtom } from "jotai";
import {
  primaryHexAtom,
  secondaryHexAtom,
  baseColorAtom,
  darkAtom,
} from "@/hooks/useTheme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";

import { Moon, Sun, Palette } from "lucide-react";

export function ThemeSwitcher() {
  const [primaryHex, setPrimaryHex] = useAtom(primaryHexAtom);
  const [secondaryHex, setSecondaryHex] = useAtom(secondaryHexAtom);
  const [baseColor, setBaseColor] = useAtom(baseColorAtom);
  const [isDark, setIsDark] = useAtom(darkAtom);

  const [primaryColor, setPrimaryColor] = useColor(primaryHex);
  const [secondaryColor, setSecondaryColor] = useColor(secondaryHex);

  // Sync atoms when picker changes
  useEffect(() => {
    setPrimaryHex(primaryColor.hex);
  }, [primaryColor, setPrimaryHex]);

  useEffect(() => {
    setSecondaryHex(secondaryColor.hex);
  }, [secondaryColor, setSecondaryHex]);

  // Sync internal picker state if external atom changes (e.g. reset)
  // This might cause loops if not careful, but useColor handles internal state well.
  // Ideally we only set picker color if it differs significantly, but useColor doesn't expose a simple setter for hex only without full object.
  // effectively useColor is the source of truth while the popover is open.

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open Theme Switcher</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="leading-none font-medium">Theme Customizer</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Tabs defaultValue="primary">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="primary" className="flex-1">
              Primary
            </TabsTrigger>
            <TabsTrigger value="secondary" className="flex-1">
              Secondary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="primary">
            <div className="space-y-2">
              <ColorPicker
                color={primaryColor}
                onChange={setPrimaryColor}
                hideInput={["hsv"]}
                hideAlpha
                height={200}
              />
            </div>
          </TabsContent>

          <TabsContent value="secondary">
            <div className="space-y-2">
              <ColorPicker
                color={secondaryColor}
                onChange={setSecondaryColor}
                hideInput={["hsv"]}
                hideAlpha
                height={200}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Base Color Selection (Placeholder for now as logic isn't fully using it) */}
        {/*
        <div className="mt-4 space-y-2">
          <Label>Base Color</Label>
          <Select value={baseColor} onValueChange={setBaseColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select base color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#808080">Gray</SelectItem>
              <SelectItem value="#64748b">Slate</SelectItem>
              <SelectItem value="#78716c">Stone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        */}
      </PopoverContent>
    </Popover>
  );
}
