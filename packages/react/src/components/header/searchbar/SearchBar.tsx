import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/shadcn/ui/command";
import { cn } from "@/lib/utils";
import { queryAtom, splitQueryAtom, useAutocomplete } from "./SearchBarAtoms";
import { useAtom } from "jotai";
import { JSON_SCHEMA, QueryItem } from "./types";
import { QueryBadge } from "./QueryBadge";
import { useTranslation } from "react-i18next";
import { HTMLAttributes, useRef, useState, useCallback } from "react";

export function SearchBar({ className }: HTMLAttributes<HTMLDivElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useAtom(queryAtom);
  const [queryPieces, setQueryPieces] = useAtom(splitQueryAtom);
  const { search, updateSearch, queryState, autocomplete } = useAutocomplete();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setQuery((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [setQuery],
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
    >
      <div className="border-base ring-offset-base-2 focus-within:ring-primary group rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {queryPieces.map((queryItem, i) => {
            return <QueryBadge item={queryItem} key={"badge" + i} />;
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={search}
            onValueChange={updateSearch}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select frameworks..."
            className="placeholder:text-base-8 ml-2 flex-1 bg-transparent outline-none"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && autocomplete.length > 0 ? (
          <>
            <div className="border-base bg-base-1 text-base-11 animate-in absolute top-0 z-10 w-full rounded-md border shadow-md outline-none">
              <CommandGroup heading="Search Options" />
              <CommandSeparator />
              <CommandGroup className="h-full overflow-auto">
                {autocomplete.map((item) => {
                  return (
                    <CommandItem
                      key={item.type + item.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      value={item.type + item.value}
                      onSelect={(_) => {
                        if (item.incomplete) {
                          console.log("autocompleteItem - incomplete", item);
                          updateSearch(
                            t(`search.class.${item.type}`, item.type) + ":",
                          );
                          return;
                        }

                        if (
                          JSON_SCHEMA[item.type].validation === undefined ||
                          JSON_SCHEMA[item.type].validation?.(item, query)
                        ) {
                          console.log("autocompleteItem - trigger", item);
                          if (item.replace) {
                            setQuery((q) =>
                              q
                                .filter((i) => i.type !== item.type)
                                .concat(item),
                            );
                          } else {
                            setQueryPieces({
                              type: "insert",
                              value: item,
                            });
                          }

                          updateSearch("");
                        } // onClick?.(e);
                      }}
                      className={"cursor-pointer"}
                    >
                      {item.type} : {item.text}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          </>
        ) : null}
      </div>
    </Command>
  );
}
