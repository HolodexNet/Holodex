import { MultiViewIcon, ToolButton } from "./ToolButton";

export function ToolButtonContainer({ icons }: { icons: MultiViewIcon[] }) {
  return (
    <div className="flex items-center gap-1 justify-center rounded-lg flex-row">
      {icons.map((icon, index) => (
        <ToolButton key={index} icon={icon} index={`${icon.tooltip}-button`} />
      ))}
    </div>
  );
}
