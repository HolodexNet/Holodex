import React from "react";
import { langs } from "@/lib/i18n";
import { currentLangAtom } from "@/store/i18n";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shadcn/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/shadcn/ui/popover";
import { useAtom } from "jotai";

import { Button } from "@/shadcn/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { t } from "i18next";
import { cn } from "@/lib/utils";

export const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useAtom(currentLangAtom);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
        >
          {langs.find((lang) => lang.short === currentLang.short)?.display ||
            t("Select Language...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[80vw] p-0">
        <Command>
          <CommandInput placeholder={t("Search language...")} />
          <CommandList>
            <CommandEmpty>{t("No organization found.")}</CommandEmpty>
            <CommandGroup>
              {langs.map((lang) => (
                <CommandItem
                  key={lang.val}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setCurrentLang(lang);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === lang.short ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {lang.display}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
