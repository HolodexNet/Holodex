import { MultiViewIcon, ToolButton } from "./ToolButton";

export function ToolButtonContainer({ icons }: { icons: MultiViewIcon[] }) {
  return (
    <div className="flex items-center gap-1 flex-row justify-center rounded-lg">
      {icons.map((icon, index) => (
        <ToolButton key={index} icon={icon} index={`${icon.tooltip}-button`} />
      ))}
    </div>
  );
}
