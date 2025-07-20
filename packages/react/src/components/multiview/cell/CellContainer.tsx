interface CellContainerProps {
  height?: number;
  width?: number;
  children?: React.ReactNode;
}

export function CellContainer({ height, width, children }: CellContainerProps) {
  return (
    <div
      className="flex flex-col"
      style={{
        height: height ? `${height}px` : "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
