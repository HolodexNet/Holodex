import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

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

export function Selector() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Favourites</DropdownMenuTrigger>
    </DropdownMenu>
  );
}
