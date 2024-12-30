import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import { englishNameAtom } from "@/store/settings";
import { userAtom } from "@/store/auth";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { Switch } from "@/shadcn/ui/switch";
import { useToast } from "@/shadcn/ui/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";
import { Users, Tag, Search } from "lucide-react";
import { QueryItem } from "./searchbar/types";
import { useSearchboxAutocomplete } from "./searchbar/hooks/useAutocomplete";
import { SettingsResetKeyButton } from "../login/SettingsResetKeyButton";

interface CalendarUsageProps {
  initialQuery?: QueryItem[];
}

export default function CalendarUsage({
  initialQuery = [],
}: CalendarUsageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user] = useAtom(userAtom);
  const [useEnglishName, setUseEnglishName] = useAtom(englishNameAtom);
  const [query, setQuery] = useState<QueryItem[]>(initialQuery);

  // Use the searchbox autocomplete hook
  const {
    search,
    updateSearch,
    autocomplete,
    autocompleteQueryState: { isLoading, error },
  } = useSearchboxAutocomplete();

  const usableAutocomplete = autocomplete.filter(
    (x) => !x.incomplete && x.type.match(/^(org|topic|vtuber)$/),
  );
  const getLiveCalendarURL = useCallback(() => {
    // Group items by type
    const grouped = query.reduce(
      (acc: Record<string, string[]>, { type, value }) => {
        switch (type) {
          case "org":
            acc.org = acc.org || [];
            acc.org.push(value);
            break;
          case "topic":
            acc.topic = acc.topic || [];
            acc.topic.push(value);
            break;
          case "vtuber":
            acc.channelId = acc.channelId || [];
            acc.channelId.push(value);
            break;
        }
        return acc;
      },
      {},
    );

    // Build params object
    const params = new URLSearchParams();
    if (useEnglishName) params.set("preferEnglishName", "1");

    // Add grouped parameters
    if (grouped.org?.length) params.set("org", grouped.org.join(","));
    if (grouped.topic?.length) params.set("topic", grouped.topic.join(","));
    if (grouped.channelId?.length)
      params.set("channelId", grouped.channelId.join(","));

    return `${window.location.origin}/live.ics?${params.toString()}`;
  }, [query, useEnglishName]);

  const getFavoritesCalendarURL = useCallback(() => {
    if (!user?.api_key) {
      return t("views.login.apikeyNew");
    }

    const params = new URLSearchParams();
    params.set("key", user.api_key);
    if (useEnglishName) params.set("preferEnglishName", "1");

    return `${window.location.origin}/user.ics?${params.toString()}`;
  }, [user, useEnglishName, t]);

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast({
      title: t("component.toast.copiedToClipboard"),
      duration: 1000,
    });
  };

  const handleSelect = (item: QueryItem) => {
    if (item.incomplete) {
      updateSearch(item.type + ":");
      return;
    }

    if (item.replace) {
      setQuery((prev) => [...prev.filter((q) => q.type !== item.type), item]);
    } else {
      setQuery((prev) => {
        // Don't add duplicates
        if (prev.some((q) => q.value === item.value)) return prev;
        return [...prev, item];
      });
    }
    updateSearch("");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "channel":
        return <div className="i-heroicons:tv rounded-md p-3" />;
      case "org":
        return <Users className="h-4 w-4" />;
      case "topic":
        return <Tag className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 rounded-lg">
      <div className="space-y-2">
        <Label>{t("Live Calendar (iCal)")}</Label>
        <div className="flex gap-2">
          <Input
            className="h-10"
            value={getLiveCalendarURL()}
            readOnly
            onClick={() => handleCopy(getLiveCalendarURL())}
          />
          <Button
            variant="base-outline"
            size="icon-lg"
            onClick={() => handleCopy(getLiveCalendarURL())}
          >
            <div className="i-heroicons:clipboard size-4 " />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="english-name">
          {t("views.settings.useEnglishNameLabel")}
        </Label>
        <Switch
          id="english-name"
          checked={useEnglishName}
          onCheckedChange={setUseEnglishName}
        />
      </div>

      <Command
        className="rounded-lg border border-base-4 shadow-md"
        shouldFilter={false}
      >
        <CommandInput
          placeholder={t("Filter by Topic, Org, Channel ...")}
          value={search}
          onValueChange={updateSearch}
        />
        <CommandList>
          {usableAutocomplete && usableAutocomplete.length === 0 && (
            <CommandEmpty>{t("No results found.")}</CommandEmpty>
          )}
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <CommandGroup>
              {usableAutocomplete.map((item) => (
                <CommandItem
                  key={item.value + item.type}
                  onSelect={() => handleSelect(item)}
                >
                  {getTypeIcon(item.type)}
                  <span className="ml-2">{item.text}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      <div className="flex flex-wrap gap-2">
        {query.map((item) => (
          <Badge
            key={item.value + item.type}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {getTypeIcon(item.type)}
            <span>{item.text}</span>
            <Button
              variant="simple"
              size="unset"
              onClick={() =>
                setQuery(query.filter((q) => q.value !== item.value))
              }
            >
              <div className="i-heroicons:x-mark" />
            </Button>
          </Badge>
        ))}
      </div>

      {user && (
        <div className="space-y-2">
          <Label>{t("Favorites Calendar (iCal)")}</Label>
          <div className="flex gap-2">
            <Input
              value={getFavoritesCalendarURL()}
              className="h-10"
              readOnly
              onClick={() => handleCopy(getFavoritesCalendarURL())}
            />
            <Button
              variant="base-outline"
              size="icon-lg"
              onClick={() => handleCopy(getFavoritesCalendarURL())}
            >
              <div className="i-heroicons:clipboard size-4 " />
            </Button>
          </div>
          {user.api_key && <SettingsResetKeyButton />}
        </div>
      )}
    </div>
  );
}
