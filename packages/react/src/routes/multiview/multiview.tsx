import { Toolbar } from "@/components/multiview/Toolbar";
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
      <div id="multiview-banner" className="flex items-center gap-1 px-8">
        <Toolbar />
      </div>
    </>
  );
}
