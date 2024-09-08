import { Selector } from "./Selector";

export function Toolbar() {
  return (
    <div className="flex items-center gap-1 px-2">
      <div>
        <Selector />
      </div>
    </div>
  );
}
