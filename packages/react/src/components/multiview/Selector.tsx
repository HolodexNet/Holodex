import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { defaultOrgs } from "../../store/org";

// I need a way to get a list of data containing the option name
// based on the option selected, a list of current streams should be displayed
// we need a current selection to hold the data
/**
 * Options beyond the existing orgs:
 * - favorites
 * - youtube url
 * - twitch url
 * - all vtubers
 */

// temporarily we will just get the favourites option

export function Selector() {
  // create a mock favourites object as an org
  const Favorites: Org = {
    name: "Favorites",
  };
  // based on what the selection is -> use different methods to render title card?
  const [currentTab, setCurrentTab] = useState(Favorites);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="z-30 mx-2 inline-flex min-h-8 w-48 shrink-0 items-center justify-between overflow-hidden rounded-md bg-base-2 py-2 pl-4 pr-2 hover:bg-primary-5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-7 active:scale-[97%] active:bg-primaryA-7 disabled:pointer-events-none disabled:opacity-50">
          {currentTab.name}
          <div className="i-lucide:chevrons-down ml-2 inline-block h-4 w-4 shrink-0 align-middle opacity-50"></div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-30 w-48 bg-base-2">
          {[Favorites, ...defaultOrgs].map((org) => {
            return (
              <DropdownMenuItem
                className="cursor-pointer gap-1 py-2"
                onClick={() => setCurrentTab(org)}
              >
                {org.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
