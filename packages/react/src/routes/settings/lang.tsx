import { SettingsItem } from "@/components/settings/SettingsItem";
import { TL_LANGS } from "@/lib/consts";
import { langs } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shadcn/ui/command";
import { Label } from "@/shadcn/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Switch } from "@/shadcn/ui/switch";
import { clipLanguageAtom, englishNameAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function SettingsLang() {
  const [useENName, setUseENName] = useAtom(englishNameAtom);
  const [clipLangs, setClipLangs] = useAtom(clipLanguageAtom);
  const [langOpen, setLangOpen] = useState(false);
  const { i18n, t } = useTranslation();

  return (
    <div className="flex flex-col p-2 md:p-4">
      <SettingsItem label={t("views.settings.languageSettings")} fullWidth>
        <div className="flex flex-col gap-3">
          <Popover open={langOpen} onOpenChange={setLangOpen}>
            <PopoverTrigger asChild>
              <Button
                size="lg"
                variant="outline"
                role="combobox"
                aria-expanded={langOpen}
                className="w-fit min-w-[240px] justify-between border-base px-4"
              >
                {langs.find(({ val }) => i18n.language === val)?.display}
                <div className="i-lucide:chevrons-up-down ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit min-w-[240px] p-0">
              <Command>
                <CommandInput
                  placeholder={t("views.settings.languageSearch")}
                />
                <CommandEmpty>
                  {t("views.settings.languageNotfound")}
                </CommandEmpty>
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
                          "i-heroicons:check mr-2 h-4 w-4",
                          val === i18n.language ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {display}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
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
          {TL_LANGS.map(({ text, value }, index) => (
            <div className="flex items-center gap-3">
              <Checkbox
                id={`cliplang-${value}`}
                checked={clipLangs.includes(value)}
                onCheckedChange={(checked) =>
                  setClipLangs((langs) =>
                    checked
                      ? [...langs, value]
                      : langs.filter((lang) => lang !== value),
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
    </div>
  );
}