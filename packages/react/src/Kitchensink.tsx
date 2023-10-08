import { useState } from "react";
import { Button } from "./shadcn/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      This page is for testing components and styling.

      Regular spacing:
      <div className="space-x-2">
        <Button>OK</Button>
        <Button variant="outline" size="lg">Cancel</Button>
      </div>

      Color and variants:
      <div className="grid grid-cols-5 items-start justify-start gap-4">
        <Button>Default button</Button>
        <Button variant="ghost">Ghost button</Button>
        <Button variant="outline">Outline button</Button>
        <Button variant="secondary">Secondary button</Button>
        <Button variant="link">Link button</Button>
        <Button size="sm">Default button</Button>
        <Button size="sm" variant="ghost">Ghost button</Button>
        <Button size="sm" variant="outline">Outline button</Button>
        <Button size="sm" variant="secondary">Secondary button</Button>
        <Button size="sm" variant="link">Link button</Button>
        <Button size="lg">Default button</Button>
        <Button size="lg" variant="ghost">Ghost button</Button>
        <Button size="lg" variant="outline">Outline button</Button>
        <Button size="lg" variant="secondary">Secondary button</Button>
        <Button size="lg" variant="link">Link button</Button>
        <Button size="icon"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon" variant="ghost"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon" variant="outline"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon" variant="secondary"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon" variant="link"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon-lg"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon-lg" variant="ghost"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon-lg" variant="outline"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon-lg" variant="secondary"><div className="i-heroicons:academic-cap"></div></Button>
        <Button size="icon-lg" variant="link"><div className="i-heroicons:academic-cap"></div></Button>
      </div>
    </>
  );
}

export default App;
