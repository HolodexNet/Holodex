import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/shadcn/ui/command";
import { useState } from "react";
import { AutocompleteDropdownItem } from "../header/searchbar/components/AutocompleteDropdownItem";
import { useQuery } from "@tanstack/react-query";
import { Command as CommandPrimitive } from "cmdk";
import {
  IdentifiedItunesTrack,
  IdentifiedTrack,
  useSongAutocomplete,
} from "./songSearch.service";
import { useDebounceValue } from "usehooks-ts";

interface ItunesItem {
  // todo
}
export function ItunesSearchDropdown({
  onSelectItem,
  className,
}: {
  className?: string;
  onSelectItem?: (item: ItunesItem) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);
  const [open, setOpen] = useState(false);

  const { data: autocomplete, isLoading } = useSongAutocomplete(
    debouncedSearch,
    {
      enabled: !!debouncedSearch,
    },
  );

  const handleItemSelect = (item: IdentifiedTrack) => {
    onSelectItem?.(item);
    setOpen(false); // Close dropdown after selection
  };
  return (
    <Command
      className={cn("overflow-visible bg-transparent relative", className)}
      shouldFilter={false}
    >
      <CommandInput
        wrapperClassName="border border-base rounded-md"
        id="itunes_search"
        placeholder="Search for existing song..."
        value={search}
        onValueChange={setSearch}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <CommandList className="absolute top-10 z-10 w-full rounded-b-md border border-solid border-base bg-base-1 text-base-11">
          {autocomplete?.length ?? 0 > 0 ? (
            <>
              <CommandGroup heading={<div>Search Results</div>} />
              <CommandSeparator />
              <CommandGroup className="h-full">
                {autocomplete?.map((item) => <TrackItem item={item} />)}
              </CommandGroup>
              {/* </div> */}
            </>
          ) : (
            <CommandEmpty />
          )}
        </CommandList>
      )}
    </Command>
  );
}

// Assuming `item` is passed as a prop to this component and is of type IdentifiedTrack | IdentifiedItunesTrack
const TrackItem = ({ item }: { item: IdentifiedItunesTrack }) => {
  const formatDuration = (milliseconds: number) => {
    // Convert milliseconds to minutes:seconds format
    let seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-row gap-2 py-1 pl-3 pr-1 hover:bg-base-4">
      <div className="h-10 w-10">
        {item.artworkUrl100 && (
          <img
            src={item.artworkUrl100}
            alt={item.trackName}
            className="h-full w-full rounded object-cover"
          />
        )}
      </div>

      <div className="grow">
        <div className="float-right font-bold text-base-10">
          {formatDuration(item.trackTimeMillis)}
        </div>
        <div className="text-primaryA-8">
          <div className="i-heroicons:musical-note -mb-1 mr-1 inline-block text-sm"></div>
          <span className="font-bold text-base-12">{item.trackName}</span>
        </div>
        {/* float the duration to the right instead */}
        <div className="text-xs text-base-11">
          🎤 {item.artistName}
          {item.collectionName && ` / ${item.collectionName}`}
          {item.releaseDate ? ` / ${item.releaseDate.slice(0, 7)}` : ""}
          <span
            className="ml-5 inline-block rounded bg-base-6 px-1 text-xs font-bold text-base-11"
            style={{ fontSize: "0.75rem" }}
          >
            {item.src}
          </span>
        </div>
      </div>
    </div>
  );
};
