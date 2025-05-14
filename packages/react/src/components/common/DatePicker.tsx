import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { DayPickerSingleProps } from "react-day-picker";
import dayjs from "dayjs";
import { Input } from "@/shadcn/ui/input";
import { useTranslation } from "react-i18next";

export function DatePicker(
  props: Omit<DayPickerSingleProps, "mode" | "onSelect"> & {
    timezone?: string;
    onSelect: (date: Date | undefined) => void;
    showTimeSelect?: boolean;
    calendarClassName?: string;
    clearable?: boolean;
  },
) {
  const { t } = useTranslation();
  // date is UTC time
  const {
    selected: date,
    onSelect,
    timezone,
    showTimeSelect = false,
    className,
    calendarClassName,
    clearable = false,
    ...rest
  } = props;
  const dateFormat = showTimeSelect ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 justify-start border-base-6 text-left text-sm font-normal focus:border-blue-6 ",
            !date && "text-base-11",
            className,
          )}
        >
          <div className="h-4 mr-2 w-4 i-heroicons:calendar" />
          {date ? (
            dayjs(date).tz(timezone).format(dateFormat)
          ) : (
            <span>{t("component.datePicker.pickDate")}</span>
          )}
          {clearable && date && (
            <button
              className="ring-offset-background ml-auto rounded-sm opacity-70 transition-opacity focus:ring-ring hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(undefined);
              }}
            >
              <div className="h-4 w-4 i-heroicons:x-mark"></div>
              <span className="sr-only">Close</span>
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto">
        <Calendar
          mode="single"
          className={calendarClassName}
          selected={date}
          // "day" is local date
          onSelect={(day) => {
            if (day)
              onSelect(
                dayjs
                  .tz(
                    `${day.getFullYear()}-${
                      Number(day.getMonth()) + 1
                    }-${day.getDate()}`,
                    timezone,
                  )
                  .toDate(),
              );
          }}
          {...rest}
        />
        {showTimeSelect && (
          <div className="px-4 pb-4">
            <Input
              value={dayjs(date).tz(timezone).format("HH:mm")}
              onChange={(e) => {
                const currentDate = dayjs(date).tz(timezone);
                const selectedDate = dayjs.tz(e.target.valueAsDate, "UTC");
                onSelect(
                  dayjs
                    .tz(
                      currentDate.startOf("day").valueOf() +
                        selectedDate.valueOf(),
                      timezone,
                    )
                    .toDate(),
                );
              }}
              type="time"
              step="60"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
