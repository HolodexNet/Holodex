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
      <div className="flex flex-wrap gap-2">
        {selectedTimezones.map((timezone) => (
          <Badge
            key={timezone}
            variant="primary"
            className="flex h-7 cursor-pointer items-center gap-1 rounded-sm p-1 pr-2"
          >
            <div className="i-mdi:clock-outline" />
            {timezone}
            <button
              onClick={() => handleTimezoneRemove(timezone)}
              className="ml-1 hover:text-primary-12"
            >
              <div className="i-mdi:close h-4 w-4" />
            </button>
          </Badge>
        ))}

        <Select onValueChange={handleTimezoneAdd}>
          <SelectTrigger
            className="flex h-7 w-7 items-center justify-center rounded-sm border-none bg-primary-9 p-0"
            showIcon={false}
          >
            <div className="i-mdi:plus h-7 w-7" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="max-h-[300px] overflow-auto">
              {timezoneOptions.map(({ label, value, offset }) => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={selectedTimezones.includes(value)}
                >
                  <div className="flex w-full justify-between">
                    <span>{label}</span>
                    <span className="text-muted-foreground ml-2">
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
