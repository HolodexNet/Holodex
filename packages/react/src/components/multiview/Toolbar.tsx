import { Selector } from "./Selector";
import { ToolButtonContainer } from "./ToolButtonContainer";

export function Toolbar() {
  return (
    <div className="flex w-full max-w-full flex-nowrap justify-between bg-base-2 p-2">
      <div className="mr-2 w-3/5 shrink-0 grow-0 basis-auto">
        <Selector />
      </div>
      <div className="ml-2 w-2/5 shrink-0 grow-0 basis-auto">
        <ToolButtonContainer />
      </div>
    </div>
  );
}
