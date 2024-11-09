import { CommandList, Command as CommandPrimitive } from "cmdk";
import { Command, CommandGroup, CommandShortcut } from "@/shadcn/ui/command";
import { cn } from "@/lib/utils";
import {
  queryAtom,
  splitQueryAtom,
  useSearchboxAutocomplete,
} from "../hooks/useAutocomplete";
import { useAtom } from "jotai";
import { JSON_SCHEMA, QueryItem, VideoQueryContainer } from "../types";
import { QueryBadge } from "./QueryBadge";
import { useTranslation } from "react-i18next";
import { HTMLAttributes, useRef, useState, useCallback } from "react";
import { AutocompleteDropdownItem } from "./AutocompleteDropdownItem";
import { Popover, PopoverTrigger } from "@/shadcn/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { getQueryModelFromQuery } from "../helper";
import { useNavigate } from "react-router-dom";
import { stringify } from "picoquery";

export function SearchBar({
  className,
  autoFocus,
}: HTMLAttributes<HTMLDivElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useAtom(queryAtom);
  const [queryPieces, setQueryPieces] = useAtom(splitQueryAtom);
  const { search, updateSearch, autocomplete } = useSearchboxAutocomplete();
  const navigate = useNavigate();

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

  const doSearch = useCallback(() => {
    if (query.length > 0) {
      const qm = getQueryModelFromQuery(query);
      if (!qm) return;
      navigate({
        pathname: "/search",
        search:
          "?" +
          stringify({
            q: qm,
            sort: "latest",
          } satisfies VideoQueryContainer),
      });
    }
  }, [navigate, query]);

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
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          doSearch();
        }
      }
    },
    [doSearch, setQuery],
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
          <div className="group rounded-md bg-base-2 p-2 text-sm ring-offset-base-2 focus-within:bg-base-3 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:bg-base-3">
            <label className="flex flex-wrap items-center gap-1">
              {queryPieces.map((queryItem, i) => {
                return (
                  <QueryBadge
                    item={queryItem}
                    key={"badge" + i}
                    onRemoveItem={() => {
                      setQueryPieces({ type: "remove", atom: queryItem });
                    }}
                  />
                );
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
              <div className="ml-auto flex flex-row opacity-0 group-focus-within:opacity-100 ">
                <CommandShortcut className="pointer-events-none opacity-80">
                  <span className="mr-1 rounded-sm bg-base-4 p-0.5">⇪</span>
                  <span className="rounded-sm bg-base-4 p-0.5">↵</span>
                </CommandShortcut>
                <button
                  type="submit"
                  className="-my-2 -mr-1 flex size-8 items-center rounded-md text-base-11 transition-all hover:bg-base-5 hover:text-primary-11"
                  disabled={query.length === 0}
                  onClick={() => doSearch()}
                  onSubmit={() => doSearch()}
                >
                  <div className="i-carbon:search mx-auto"></div>
                </button>
              </div>
            </label>
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
              <div
                className="min-w-80 rounded-md border border-base bg-base-2 text-base-11 outline-none animate-in fade-in-20 slide-in-from-top-2  sm:left-auto sm:w-full"
                style={{
                  boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
                }}
              >
                <CommandGroup
                  className="h-full overflow-auto"
                  heading={
                    <div>
                      {t("search.options_menu_header")}
                      <span className="float-right">
                        <CommandShortcut className="pointer-events-none opacity-80">
                          <span className="mr-1 rounded-sm bg-base-4 p-0.5">
                            ↕
                          </span>
                        </CommandShortcut>
                      </span>
                    </div>
                  }
                >
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
