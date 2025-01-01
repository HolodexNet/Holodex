import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shadcn/ui/command";
import { useState } from "react";
import {
  IdentifiedItunesTrack,
  IdentifiedTrack,
  useSongAutocomplete,
} from "./songSearch.service";
import { useDebounceValue } from "usehooks-ts";
import { localeAtom } from "@/store/i18n";
import { useAtomValue } from "jotai";

export function ItunesSearchDropdown({
  onSelectItem,
  className,
}: {
  className?: string;
  onSelectItem?: (item: IdentifiedTrack) => void;
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
    console.log(item);
    onSelectItem?.(item);
    setOpen(false); // Close dropdown after selection
  };
  return (
    <Command
      className={cn("relative overflow-visible bg-transparent", className)}
      shouldFilter={false}
    >
      <CommandInput
        wrapperClassName="border border-base rounded-md focus-within:ring-2 focus-within:ring-primary-9"
        id="itunes_search"
        className=""
        placeholder="Search for existing song..."
        value={search}
        onValueChange={setSearch}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
      />
      {open &&
        (autocomplete?.length ?? 0 > 0 ? (
          <CommandList className="absolute top-10 z-10 w-full rounded-b-md border border-solid border-base bg-base-1 text-base-11">
            <CommandGroup heading={<div>Search Results</div>} />
            <CommandSeparator />
            <CommandGroup className="h-full">
              {autocomplete?.map((item, i) => (
                <CommandItem
                  onSelectCapture={(v) => {
                    console.log(v);
                    handleItemSelect(item);
                  }}
                  key={item.trackId ?? item.trackName + i}
                  value={String(i)}
                >
                  <SongItem {...item} />
                </CommandItem>
              ))}
            </CommandGroup>
            {/* </div> */}
          </CommandList>
        ) : (
          <CommandList>
            <CommandEmpty />
          </CommandList>
        ))}
    </Command>
  );
}

function SongItem({
  artworkUrl100,
  trackName,
  artistName,
  collectionName,
  releaseDate,
}: Pick<
  IdentifiedItunesTrack,
  | "artworkUrl100"
  | "trackName"
  | "artistName"
  | "collectionName"
  | "releaseDate"
>) {
  const { dayjs } = useAtomValue(localeAtom);

  return (
    <div className="flex items-center justify-center gap-2">
      <img className="h-10 w-10 rounded-sm" src={artworkUrl100 || ""} />
      <div className="flex flex-col">
        <span className="font-bold">{trackName}</span>
        <span className="text-sm text-base-11">
          {artistName} / {collectionName} /{" "}
          {dayjs(releaseDate).format("YYYY-MM")}
        </span>
      </div>
    </div>
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
    <div className="flex w-full flex-row gap-2">
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