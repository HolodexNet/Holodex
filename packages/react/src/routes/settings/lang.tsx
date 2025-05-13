import { SettingsItem } from "@/components/settings/SettingsItem";
import TimezoneSelector from "@/components/settings/SettingsTimezonePicker";
import { TL_LANGS } from "@/lib/consts";
import { langs } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { clipLanguageAtom, englishNameAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";

export function SettingsLang() {
  const [clipLangs, setClipLangs] = useAtom(clipLanguageAtom);
  const [langOpen, setLangOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const [useENName, setUseENName] = useAtom(englishNameAtom);

  return (
    <div className="flex flex-col space-y-6">
      {/* Interface Language Section */}
      <SettingsItem label={t("views.settings.languageSettings")} fullWidth>
        <div className="flex flex-col gap-3">
          <Popover open={langOpen} onOpenChange={setLangOpen}>
            <PopoverTrigger asChild>
              <button
                role="combobox"
                aria-expanded={langOpen}
                className={cn(
                  "inline-flex min-h-8 w-full min-w-48 items-center justify-between rounded-md bg-base-3 py-1 pl-4 pr-2",
                  "text-left text-lg font-medium text-base-12 transition",
                  "hover:bg-primary-5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary-7 active:scale-[97%] active:bg-primaryA-7 disabled:pointer-events-none disabled:opacity-50",
                  langOpen && "bg-base-4 ring-2 ring-primary-9 hover:bg-base-5",
                )}
              >
                {langs.find(({ val }) => i18n.language === val)?.display}
                <div className="i-lucide:chevrons-up-down ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-fit min-w-[240px] p-0">
              <Command>
                <CommandInput
                  placeholder={t("views.settings.languageSearch")}
                />
                <CommandEmpty>
                  {t("views.settings.languageNotfound")}
                </CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {langs.map(({ val, display }) => (
                      <CommandItem
                        key={val}
                        onSelect={() => {
                          i18n.changeLanguage(val);
                          setLangOpen(false);
                        }}
                      >
                        <div
                          className={cn(
                            "i-lucide:check mr-2 h-4 w-4",
                            val === i18n.language ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {display}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {/* Translation Credits */}
          <div className="flex items-center gap-1 text-xs text-base-11">
            <div className="i-heroicons:heart" />
            {langs.find(({ val }) => i18n.language === val)?.credit}
          </div>
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.settings.useEnglishNameLabel")} fullWidth>
        <div className="flex gap-3">
          <Checkbox
            id="use_english_names"
            checked={useENName}
            onCheckedChange={(c) => setUseENName(!!c)}
          />
          <Label
            htmlFor="use_english_names"
            className={cn({
              "opacity-65": !useENName,
            })}
          >
            {t("views.settings.useEnglishNameMsg")}
          </Label>
          {/* <div className="flex grow" /> */}
          {/* <Switch
            id="use_english_names"
            checked={useENName}
            onCheckedChange={setUseENName}
          /> */}
        </div>
      </SettingsItem>
      <SettingsItem label={t("views.settings.clipLanguageSelection")} fullWidth>
        <div className="grid gap-3">
          {TL_LANGS.map(({ text, value }) => (
            <div className="flex items-center gap-3" key={"cliplang-" + value}>
              <Checkbox
                id={`cliplang-${value}`}
                checked={clipLangs.includes(value)}
                onCheckedChange={(checked) =>
                  setClipLangs(
                    checked
                      ? [...clipLangs, value]
                      : clipLangs.filter((lang) => lang !== value),
                  )
                }
              />
              <Label
                className={cn({
                  "opacity-65": !clipLangs.includes(value),
                })}
                htmlFor={`cliplang-${value}`}
              >
                {text}
              </Label>
            </div>
          ))}
        </div>
      </SettingsItem>

      {/* Regional Settings */}
      <SettingsItem label={t("views.settings.showTimezonesOnHover")} fullWidth>
        <TimezoneSelector />
      </SettingsItem>
    </div>
  );
}
