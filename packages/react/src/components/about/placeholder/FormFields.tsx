import { useMemo, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shadcn/ui/radio-group";
import { DatePicker } from "@/components/common/DatePicker";
import { ChannelPicker } from "@/components/channel/ChannelPicker";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { allTimezones } from "../../settings/timezones";
import { localeAtom } from "@/store/i18n";
import { useAtomValue } from "jotai";

export const FormInput = ({
  name,
  label,
  description,
  ...props
}: {
  name: string;
  label: string;
  description?: string;
} & Omit<Parameters<typeof Input>[0], "id">) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormRadioGroup = ({
  name,
  label,
  options,
  ...props
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
} & Omit<
  Parameters<typeof RadioGroup>[0],
  "onValueChange" | "defaultValue"
>) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              {...props}
            >
              {options.map(({ value, label }) => (
                <FormItem
                  key={value}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={value} />
                  </FormControl>
                  <FormLabel className="font-normal">{label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormDatePicker = ({
  name,
  label,
  ...props
}: Parameters<typeof DatePicker>[0] & { name: string; label: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const { dayjs } = useAtomValue(localeAtom);
  const [timezone, setTimezone] = useState("Asia/Tokyo");
  const timezoneOptions = useMemo(() => {
    return Object.keys(allTimezones).map((tz) => {
      const now = dayjs().tz(tz);
      const offset = now.format("Z");
      return {
        value: tz,
        label: tz,
        offset: offset,
      };
    });
  }, [dayjs]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-2">
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-9 w-auto shrink">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {timezoneOptions.map(({ label, value, offset }) => (
                      <SelectItem key={value} value={value}>
                        {label} ({offset})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <DatePicker
                selected={field.value ? new Date(field.value) : undefined}
                timezone={timezone}
                {...props}
                onSelect={(date: Date) => field.onChange(date.toISOString())}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
export const FormChannelPicker = ({
  name,
  label,
  ...props
}: Parameters<typeof ChannelPicker>[0] & { name: string; label: string }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ChannelPicker
              {...props}
              value={field.value}
              onSelect={({ id }) => field.onChange(id)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
