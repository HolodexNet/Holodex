import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import atomWithDebounce from "@/lib/atomWithDebounce";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { localeAtom } from "@/store/i18n";

const { currentValueAtom, debouncedValueAtom } = atomWithDebounce("");

export function SongSearch({
  value,
  onSelect,
}: {
  value: Song["song"] | null;
  onSelect: (song?: ITunesSong) => void;
}) {
  const { t } = useTranslation();
  const { dayjs } = useAtomValue(localeAtom);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [debouncedValue, setValue] = useAtom(debouncedValueAtom);
  const currentValue = useAtomValue(currentValueAtom);
  const [open, setOpen] = useState(false);
  const { mutate, data, isPending } = useMutation({
    mutationFn: async (value: string): Promise<ITunesSongSearchResult> =>
      (
        await fetch(
          `https://itunes.apple.com/search?${new URLSearchParams({
            term: value,
            entity: "musicTrack",
            country: "JP",
            limit: "10",
            lang: "ja_JP",
          })}`,
        )
      ).json(),
  });

  useEffect(() => {
    mutate(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          ref={buttonRef}
          role="combobox"
          aria-expanded={open}
          className="flex min-h-[3rem] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-base px-4 py-2 hover:bg-base-4"
        >
          {value ? (
            <SongItem {...value} />
          ) : (
            <span>{t("editor.music.itunesLookupPlaceholder")}</span>
          )}
          {value && (
            <Button
              size="icon"
              variant="ghost-secondary"
              className="ml-auto text-red-11"
              onClick={() => onSelect()}
            >
              <X />
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        style={{ width: buttonRef.current?.clientWidth }}
        className="p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={currentValue}
            onValueChange={setValue}
            placeholder={t("editor.music.itunesLookupPlaceholder")}
          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {data?.results.map((song) => (
                <CommandItem
                  key={song.trackId}
                  value={song.trackId.toString()}
                  onSelect={(id) => {
                    onSelect(
                      data?.results.find(
                        ({ trackId }) => trackId.toString() === id,
                      ),
                    );
                    setOpen(false);
                  }}
                >
                  <SongItem {...song} />
                </CommandItem>
              ))}
              {isPending && (
                <CommandItem className="flex justify-center py-4" disabled>
                  <Loader2 className="animate-spin" />
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SongItem({
  artworkUrl100,
  trackName,
  artistName,
  collectionName,
  releaseDate,
}: Pick<
  ITunesSong,
  | "artworkUrl100"
  | "trackName"
  | "artistName"
  | "collectionName"
  | "releaseDate"
>) {
  const { dayjs } = useAtomValue(localeAtom);

  return (
    <div className="flex items-center justify-center gap-2">
      <img className="h-10 w-10 rounded-sm" src={artworkUrl100} />
      <div className="flex flex-col">
        <span className="font-bold">{trackName}</span>
        <span className="text-xs text-base-11">
          {artistName} / {collectionName} /{" "}
          {dayjs(releaseDate).format("YYYY-MM")}
        </span>
      </div>
    </div>
  );
}
