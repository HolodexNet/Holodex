import { Slider } from "@/shadcn/ui/slider";
import { SliderProps } from "@radix-ui/react-slider";
import { useState } from "react";

export function SongTimeSlider({ onValueChange, ...rest }: SliderProps) {
  const [value, setValue] = useState(5);

  return (
    <Slider
      className="w-full"
      min={0}
      max={10}
      step={1}
      value={[value]}
      onValueChange={([v]) => {
        setValue(v);
        if (onValueChange) onValueChange([v - value > 0 ? 1 : -1]);
      }}
      onValueCommit={() => setValue(5)}
      {...rest}
    />
  );
}
