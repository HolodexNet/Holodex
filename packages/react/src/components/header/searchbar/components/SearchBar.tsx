import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/shadcn/ui/command";
import { cn } from "@/lib/utils";
import {
  queryAtom,
  splitQueryAtom,
  useAutocomplete,
} from "../hooks/useAutocomplete";
import { useAtom } from "jotai";
import { JSON_SCHEMA, QueryItem } from "../types";
import { QueryBadge } from "./QueryBadge";
import { useTranslation } from "react-i18next";
import { HTMLAttributes, useRef, useState, useCallback } from "react";
import { AutocompleteDropdownItem } from "./AutocompleteDropdownItem";

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

  const handleItemSelect = useCallback(
    (item: QueryItem) => {
      if (item.incomplete) {
        console.log("autocompleteItem - incomplete", item);
        updateSearch(t(`search.class.${item.type}`, item.type) + ":");
        return;
      }

      if (
        JSON_SCHEMA[item.type].validation === undefined ||
        JSON_SCHEMA[item.type].validation?.(item, query)
      ) {
        console.log("autocompleteItem - trigger", item);
        if (item.replace) {
          setQuery((q) => q.filter((i) => i.type !== item.type).concat(item));
        } else {
          setQueryPieces({
            type: "insert",
            value: item,
          });
        }

        updateSearch("");
      } // onClick?.(e);
    },
    [query, updateSearch, t, setQuery, setQueryPieces],
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
      shouldFilter={false}
    >
      <div className="group rounded-md bg-base-2 px-3 py-2 text-sm ring-offset-base-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:bg-base-3">
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
            placeholder={t("component.search.searchLabel")}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-base-8"
          />
        </div>
      </div>
      <div className="relative">
        {open && autocomplete.length > 0 ? (
          <>
            <div className="absolute top-2 z-10 w-full rounded-md border border-base bg-base-2 text-base-11 shadow-lg outline-none animate-in">
              <CommandGroup
                heading={<div>{t("search.menu_header_text")}</div>}
              />
              <CommandSeparator />
              <CommandGroup className="h-full overflow-auto">
                {autocomplete.map((item) => {
                  return (
                    <AutocompleteDropdownItem
                      item={item}
                      onSelect={() => handleItemSelect(item)}
                    />
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
