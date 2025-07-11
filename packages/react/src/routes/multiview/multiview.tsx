import { ToolBar } from "@/components/multiview/toolbar/ToolBar";
import { Helmet } from "react-helmet-async";

// multiview skeleton
// selection bar at the top to change between orgs and allow url insertion
// grid page for drag and drop

export function Multiview() {
  return (
    <>
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>
      <div className="relative max-w-full overflow-x-hidden">
        <ToolBar />
      </div>
    </>
  );
}
