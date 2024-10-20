import React from "react";
import { CLIPPER_LANGS } from "@/lib/consts";
import { atom, useAtom, useSetAtom } from "jotai";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/shadcn/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/shadcn/ui/popover";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { clipLanguageAtom } from "@/store/settings";
import { useTranslation } from "react-i18next";

// Define the toggle atom
const toggleClipLanguageAtom = atom(
  null, // Read function returns null as this is a write-only atom
  (get, set, langValue: string) => {
    const currentLangs = get(clipLanguageAtom);
    if (currentLangs.includes(langValue)) {
      set(
        clipLanguageAtom,
        currentLangs.filter((lang) => lang !== langValue),
      );
    } else {
      set(clipLanguageAtom, [...currentLangs, langValue]);
    }
  },
);

export const ClipLanguageSelector: React.FC = () => {
  const [selectedLangs] = useAtom(clipLanguageAtom);
  const toggleLanguage = useSetAtom(toggleClipLanguageAtom);
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          size="icon-lg"
          aria-expanded={open}
          title={t("views.settings.clipLanguageSelection")}
        >
          <div className="relative h-6 w-6">
            <div className="i-tabler:language-hiragana absolute h-full w-full text-xl" />
            <div
              className="i-mdi:filter-gear-outline absolute inset-0 mb-auto ml-auto h-full w-full opacity-50"
              style={{ fontSize: "10px", marginBottom: "3px" }}
            />
          </div>
          <span className="sr-only">Select clip language</span>{" "}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[80vw] p-0">
        <Command>
          {/* <CommandInput placeholder={t("Search languages...")} /> */}
          <CommandList>
            <CommandGroup heading={t("views.settings.clipLanguageSelection")}>
              <CommandItem disabled className="p-0">
                {selectedLangs.length > 0 && (
                  <div className="mb-1 flex w-full flex-wrap gap-1 border-b border-base-5 p-2 pt-0">
                    {selectedLangs.map((langValue) => {
                      const lang = CLIPPER_LANGS.find(
                        (l) => l.value === langValue,
                      );
                      return (
                        <Button
                          key={langValue}
                          variant="primary"
                          size="sm"
                          onClick={() => toggleLanguage(langValue)}
                        >
                          {lang?.text}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CommandItem>
              {CLIPPER_LANGS.map((lang) => (
                <CommandItem
                  key={lang.value}
                  onSelect={() => toggleLanguage(lang.value)}
                >
                  <div
                    className={cn(
                      "i-lucide:check mr-2 h-4 w-4",
                      selectedLangs.includes(lang.value)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {lang.text}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
