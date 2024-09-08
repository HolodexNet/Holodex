import { Selector } from "./Selector";
import { ToolButtonContainer } from "./ToolButtonContainer";

export function Toolbar() {
  return (
    <div className="inline-flex w-full content-center justify-between bg-base-2 p-2">
      <Selector />
      <ToolButtonContainer />
    </div>
  );
}
