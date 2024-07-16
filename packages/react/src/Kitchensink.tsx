import { useState } from "react";
import { Button } from "./shadcn/ui/button";
import { FancyMultiSelect } from "./shadcn/ui/fancy-multiselect";
import { Switch } from "./shadcn/ui/switch";
import { Label } from "./shadcn/ui/label";
import { Checkbox } from "./shadcn/ui/checkbox";

export function Kitchensink() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-4 p-4">
      <h3>This page is for testing components and styling.</h3>

      <hr className="border-base" />

      <h3>Regular spacing:</h3>
      <div className="space-x-2">
        <Button>OK</Button>
        <Button variant="outline" size="lg">
          Cancel
        </Button>
      </div>

      <hr className="border-base" />

      <h3>Color and variants:</h3>
      <div className="flex max-w-5xl flex-row flex-wrap items-start justify-start gap-4">
        <Button>Default button</Button>
        <Button variant="ghost">Ghost button</Button>
        <Button variant="outline">Outline button</Button>
        <Button variant="secondary">Secondary button</Button>
        <Button variant="link">Link button</Button>
        <Button size="sm">Default button</Button>
        <Button size="sm" variant="ghost">
          Ghost button
        </Button>
        <Button size="sm" variant="outline">
          Outline button
        </Button>
        <Button size="sm" variant="secondary">
          Secondary button
        </Button>
        <Button size="sm" variant="link">
          Link button
        </Button>
        <Button size="lg">Default button</Button>
        <Button size="lg" variant="ghost">
          Ghost button
        </Button>
        <Button size="lg" variant="outline">
          Outline button
        </Button>
        <Button size="lg" variant="secondary">
          Secondary button
        </Button>
        <Button size="lg" variant="link">
          Link button
        </Button>
        <Button size="icon">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon" variant="ghost">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon" variant="outline">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon" variant="secondary">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon" variant="link">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon-lg">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon-lg" variant="ghost">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon-lg" variant="outline">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon-lg" variant="secondary">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
        <Button size="icon-lg" variant="link">
          <div className="i-heroicons:academic-cap"></div>
        </Button>
      </div>

      <hr className="border-base" />
      <h3>Some fancy Multiselect:</h3>

      <FancyMultiSelect />

      <hr className="border-base" />
      <h3>Toggles and Checkboxes</h3>
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
      </div>
    </div>
  );
}
