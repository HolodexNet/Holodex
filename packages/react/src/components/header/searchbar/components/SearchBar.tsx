import { CommandList, Command as CommandPrimitive } from "cmdk";
import { Command, CommandGroup } from "@/shadcn/ui/command";
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
import { Popover, PopoverTrigger } from "@/shadcn/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export function SearchBar({
  className,
  autoFocus,
}: HTMLAttributes<HTMLDivElement>) {
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
      }
    },
    [query, updateSearch, t, setQuery, setQueryPieces],
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn("overflow-visible bg-transparent", className)}
      shouldFilter={false}
    >
      <Popover
        open={open && autocomplete.length > 0}
        onOpenChange={() => {
          /* ignore the event, basically popover needs to be mostly inert and controlled by the focus state of the input */
        }}
      >
        <PopoverTrigger asChild>
          <div className="group rounded-md bg-base-2 p-2 text-sm ring-offset-base-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:bg-base-3">
            <div className="flex flex-wrap gap-1">
              {queryPieces.map((queryItem, i) => {
                return <QueryBadge item={queryItem} key={"badge" + i} />;
              })}
              {/* Avoid having the "Search" Icon */}
              <CommandPrimitive.Input
                ref={inputRef}
                value={search}
                autoFocus={autoFocus}
                onValueChange={updateSearch}
                onBlur={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                placeholder={t("component.search.searchLabel")}
                className="ml-2 flex-1 bg-transparent outline-none placeholder:text-base-8"
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align={"center"}
            sideOffset={4}
            className="z-50"
            sticky="partial"
            autoFocus={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            style={{
              width: "var(--radix-popover-trigger-width)",
              maxHeight: "var(--radix-popover-content-available-height)",
            }}
          >
            <CommandList>
              <div className="min-w-80 rounded-md border border-base bg-base-2 text-base-11 shadow-lg outline-none animate-in sm:left-auto sm:w-full">
                <CommandGroup heading={t("search.menu_header_text")} />
                <hr className="h-px border-base-5" />
                <CommandGroup className="h-full overflow-auto">
                  {autocomplete.map((item) => {
                    return (
                      <AutocompleteDropdownItem
                        key={item.text + item.type + item.value}
                        item={item}
                        onSelect={() => handleItemSelect(item)}
                      />
                    );
                  })}
                </CommandGroup>
              </div>
            </CommandList>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </Popover>
    </Command>
  );
}
