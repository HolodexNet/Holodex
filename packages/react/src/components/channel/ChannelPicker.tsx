import atomWithDebounce from "@/lib/atomWithDebounce";
import { useSearchAutoCompleteMutation } from "@/services/search.service";
import { Button } from "@/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shadcn/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

interface VtuberPickerProps<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
> {
  name?: FieldPath<T>;
  form?: UseFormReturn<T>;
  value: FieldPathValue<T, FieldName>;
  onSelect: (value: SearchAutoCompleteChannel) => void;
}

const { currentValueAtom, debouncedValueAtom } = atomWithDebounce(
  "",
  300,
  true,
);

export function ChannelPicker<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
>({ name, form, value, onSelect }: VtuberPickerProps<T, FieldName>) {
  const { t } = useTranslation();
  const currentValue = useAtomValue(currentValueAtom);
  const [debouncedValue, setDebouncedValue] = useAtom(debouncedValueAtom);
  const { data, mutate, isPending } = useSearchAutoCompleteMutation();

  useEffect(() => {
    if (debouncedValue) mutate({ q: debouncedValue, n: 10, t: "vtuber" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="justify-between border-base-6 px-4 focus:border-blue-6"
          size="lg"
          variant="outline"
          role="combobox"
        >
          {value || t("channelRequest.ChannelPickerLabel")}
          <div className="i-lucide:chevrons-up-down text-sm opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder={t("channelPicker.search")}
            value={currentValue}
            onValueChange={setDebouncedValue}
            {...(name && {
              ...form?.register(name, {
                required: {
                  value: true,
                  message: t("channelRequest.required"),
                },
              }),
            })}
          />
          <CommandEmpty>{t("component.channelPicker.notFound")}</CommandEmpty>
          <CommandGroup>
            {data?.vtuber?.map((channel) => (
              <CommandItem
                key={channel.id}
                value={channel.name}
                onSelect={() => onSelect(channel)}
              >
                {channel.name}
              </CommandItem>
            ))}
            {isPending && (
              <CommandItem className="flex justify-center py-2" disabled>
                <div className="i-lucide:loader-2 animate-spin" />
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
