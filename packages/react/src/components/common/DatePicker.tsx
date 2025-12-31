import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import "react-day-picker/style.css";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { PropsSingle, DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import { Input } from "@/shadcn/ui/input";
import { useTranslation } from "react-i18next";

export function DatePicker(
  props: Omit<PropsSingle, "mode" | "onSelect"> & {
    timezone?: string;
    onSelect: (date: Date | undefined) => void;
    showTimeSelect?: boolean;
    calendarClassName?: string;
    clearable?: boolean;
    className?: string;
    wrapperClassName?: string;
    id?: string;
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
            "focus:border-blue-6 h-9 justify-start text-left text-sm font-normal",
            !date && "",
            className,
          )}
        >
          <div className="i-heroicons:calendar mr-2 h-4 w-4" />
          {date ? (
            dayjs(date).tz(timezone).format(dateFormat)
          ) : (
            <span>{t("component.datePicker.pickDate")}</span>
          )}
          {clearable && date && (
            <button
              className="ml-auto rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(undefined);
              }}
            >
              <div className="i-heroicons:x-mark h-4 w-4"></div>
              <span className="sr-only">Close</span>
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DayPicker
          animate
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
