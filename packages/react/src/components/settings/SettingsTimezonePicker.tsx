import React, { useState, useMemo } from "react";
import { Button } from "@/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shadcn/ui/command";
import { localeAtom, preferredTimezonesAtom } from "@/store/i18n";
import { useAtom, useAtomValue } from "jotai";
import { Badge } from "@/shadcn/ui/badge";
import { allTimezones } from "./timezones";

const TimezoneSelector = () => {
  const { dayjs } = useAtomValue(localeAtom);
  const [open, setOpen] = useState(false);
  const [selectedTimezones, setSelectedTimezones] = useAtom(
    preferredTimezonesAtom,
  );
  const [showTimezonesOnHover, setShowTimezonesOnHover] = useState(false);

  const timezoneOptions = useMemo(() => {
    return Object.keys(allTimezones).map((tz) => {
      const now = dayjs().tz(tz);
      const offset = now.format("Z");
      return {
        value: tz,
        label: `${tz}`,
        offset: offset,
      };
    });
  }, [dayjs]);

  const handleTimezoneSelect = (timezone: string) => {
    if (!selectedTimezones.includes(timezone)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
    setOpen(false);
  };

  const handleTimezoneRemove = (timezone: string) => {
    setSelectedTimezones(selectedTimezones.filter((tz) => tz !== timezone));
  };

  return (
    <div className="space-y-4">
      {selectedTimezones.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTimezones.map((timezone) => (
            <Badge
              key={timezone}
              variant="primary"
              className="cursor-pointer rounded-sm p-1"
              onClick={() => handleTimezoneRemove(timezone)}
            >
              <span className="i-mdi:clock-outline h-4 w-4" />
              {timezone}
              <span className="i-mdi:close h-4 w-4" />
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-60 justify-between"
          >
            <span className="i-mdi:earth mr-2 h-5 w-5" />
            {selectedTimezones.length === 0
              ? "Select timezones"
              : `${selectedTimezones.length} selected`}
            <span className="i-mdi:chevron-down ml-2 h-5 w-5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search timezone..." className="h-9" />
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {timezoneOptions.map((tz) => (
                <CommandItem
                  key={tz.value}
                  onSelect={() => handleTimezoneSelect(tz.value)}
                >
                  <div className="flex w-full flex-row items-center">
                    <div className="flex flex-col">
                      {tz.label}
                      <span className="text-muted">
                        {allTimezones[tz.label]}
                      </span>
                    </div>
                    <div className="ml-auto text-xs text-muted">
                      (UTC{tz.offset})
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimezoneSelector;
