import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
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
        <DropdownMenuTrigger>{currentTab.name}</DropdownMenuTrigger>
        <DropdownMenuContent>
          {[Favorites, ...defaultOrgs].map((org) => {
            return (
              <DropdownMenuItem onClick={() => setCurrentTab(org)}>
                {org.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
