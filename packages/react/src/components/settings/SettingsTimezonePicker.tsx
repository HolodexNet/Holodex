import React from "react";
import { localeAtom, preferredTimezonesAtom } from "@/store/i18n";
import { useAtom, useAtomValue } from "jotai";
import { Badge } from "@/shadcn/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/shadcn/ui/select";
import { allTimezones } from "./timezones";

export default function TimezoneSelector() {
  const { dayjs } = useAtomValue(localeAtom);
  const [selectedTimezones, setSelectedTimezones] = useAtom(
    preferredTimezonesAtom,
  );

  const timezoneOptions = Object.keys(allTimezones).map((tz) => {
    const now = dayjs().tz(tz);
    const offset = now.format("Z");
    return {
      value: tz,
      label: tz,
      offset: offset,
    };
  });

  const handleTimezoneAdd = (timezone: string) => {
    if (!selectedTimezones.includes(timezone)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
  };

  const handleTimezoneRemove = (timezone: string) => {
    setSelectedTimezones(selectedTimezones.filter((tz) => tz !== timezone));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {selectedTimezones.map((timezone) => (
          <Badge
            key={timezone}
            variant="primary"
            className="flex cursor-pointer items-center gap-1 h-7 rounded-sm p-1 pr-2"
          >
            <div className="i-mdi:clock-outline" />
            {timezone}
            <button
              onClick={() => handleTimezoneRemove(timezone)}
              className="ml-1 hover:text-primary-12"
            >
              <div className="h-4 w-4 i-mdi:close" />
            </button>
          </Badge>
        ))}

        <Select onValueChange={handleTimezoneAdd}>
          <SelectTrigger
            className="flex h-7 items-center rounded-sm justify-center p-0 w-7 border-none bg-primary-9"
            showIcon={false}
          >
            <div className="h-7 w-7 i-mdi:plus" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="overflow-auto max-h-[300px]">
              {timezoneOptions.map(({ label, value, offset }) => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={selectedTimezones.includes(value)}
                >
                  <div className="flex w-full justify-between">
                    <span>{label}</span>
                    <span className="ml-2 text-muted-foreground">
                      (UTC{offset})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
