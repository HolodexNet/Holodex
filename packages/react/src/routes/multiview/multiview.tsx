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
      <div
        id="multiview-banner"
        className="sticky top-0 z-20 flex justify-start gap-2 rounded-lg bg-base-2 p-2 text-base-11 transition-all md:mx-8 md:px-2"
      >
        <Toolbar />
      </div>
    </>
  );
}
