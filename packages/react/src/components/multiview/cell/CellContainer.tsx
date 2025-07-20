interface CellContainerProps {
  height?: number;
  width?: number;
  children?: React.ReactNode;
}

export function CellContainer({ height, width, children }: CellContainerProps) {
  return (
    <div
      className="flex flex-col border-2 border-blue-6 rounded-lg box-border"
      style={{
        height: height ? `${height}px` : "100%",
      }}
    >
      {children}
    </div>
  );
}
