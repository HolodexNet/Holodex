import { useComputedDimensions } from "@/hooks/useComputedDimensions";
import { readMultiviewCellsAtom } from "@/store/multiview";
import { useAtomValue } from "jotai";
import GridLayout from "react-grid-layout";

interface LayoutProps {
  layout: GridLayout.Layout[];
  isFullScreen?: boolean;
}

export function Layout({ layout, isFullScreen = false }: LayoutProps) {
  const { cells } = useAtomValue(readMultiviewCellsAtom);
  const { dimensions } = useComputedDimensions(isFullScreen);

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
    >
      <div key="a">a</div>
      <div key="b">b</div>
      <div key="c">c</div>
    </GridLayout>
  );
}
