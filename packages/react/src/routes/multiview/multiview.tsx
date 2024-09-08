import { Selector } from "@/components/multiview/Selector";
import { useFavorites } from "@/services/user.service";
import { Helmet } from "react-helmet-async";

// multiview skeleton
// selection bar at the top to change between orgs and allow url insertion
// grid page for drag and drop

export function Multiview() {
  // remember current selection
  const favorites = useFavorites();

  return (
    <>
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>
      <div id="multiview-banner" className="flex items-center gap-1 px-8">
        <Selector />
      </div>
    </>
  );
}
