import atomWithDebounce from "@/lib/jotai/atomWithDebounce";
import { useChannel } from "@/services/channel.service";
import { useSearchAutoCompleteMutation } from "@/services/search.service";
import { Button } from "@/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { usePreferredName } from "@/store/settings";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

const { currentValueAtom, debouncedValueAtom } = atomWithDebounce(
  "",
  300,
  true,
);

interface VtuberPickerProps<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
> {
  name?: FieldPath<T>;
  form?: UseFormReturn<T>;
  value: FieldPathValue<T, FieldName>;
  onSelect: (value: SearchAutoCompleteChannel) => void;
  type?: "vtuber" | "any_channel" | "clipper";
}

export function ChannelPicker<
  T extends FieldValues,
  FieldName extends FieldPath<T>,
>({
  name,
  form,
  value,
  onSelect,
  type = "vtuber",
}: VtuberPickerProps<T, FieldName>) {
  const { t } = useTranslation();
  const currentValue = useAtomValue(currentValueAtom);
  const [debouncedValue, setDebouncedValue] = useAtom(debouncedValueAtom);
  const { data, mutate, isPending } = useSearchAutoCompleteMutation();

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 1)
      mutate({ q: debouncedValue, n: 10, t: type });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const { data: selectedChannel } = useChannel(value, { enabled: !!value });
  const preferredSelectedName = usePreferredName(selectedChannel || {});

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="justify-between border-base-6 pr-2 text-base-11 focus:border-blue-6"
          variant="outline"
          role="combobox"
        >
          {preferredSelectedName ||
            value ||
            t("channelRequest.ChannelPickerLabel")}
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
          <CommandList>
            {isPending && (
              <div className="flex w-full">
                <div className="i-lucide:loader-2 mx-auto animate-spin" />
              </div>
            )}
            <CommandEmpty>
              {!isPending && t("component.channelPicker.notFound")}
            </CommandEmpty>
            <CommandGroup>
              {data?.[type]?.map((channel) => (
                <CommandItem
                  key={channel.id}
                  value={channel.name}
                  onSelect={() => onSelect(channel)}
                >
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
