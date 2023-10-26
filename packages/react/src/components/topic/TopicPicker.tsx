import { useState, useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shadcn/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/shadcn/ui/popover";
import { useTranslation } from "react-i18next";
import { useAtom, useAtomValue } from "jotai/react";
import { useSearchAutoCompleteMutation } from "@/services/search.service";
import atomWithDebounce from "@/lib/atomWithDebounce";

const { debouncedValueAtom, currentValueAtom } = atomWithDebounce("", 300);

interface TopicPickerProps {
  onSelect: (topicId: string) => void;
}

export function TopicPicker({ onSelect }: TopicPickerProps) {
  const [deboundcedValue, setDebouncedValue] = useAtom(debouncedValueAtom);
  const currentValue = useAtomValue(currentValueAtom);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data, isPending, mutate } = useSearchAutoCompleteMutation();

  useEffect(() => {
    mutate({
      q: deboundcedValue,
      t: "topic",
      n: 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deboundcedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          className="w-full justify-between px-4"
        >
          {t("component.topicPicker.pickLabel")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[80vw] p-0">
        <Command>
          <CommandInput
            value={currentValue}
            onValueChange={setDebouncedValue}
            placeholder={t("component.topicPicker.searchLabel")}
          />
          <CommandList>
            <CommandEmpty>{t("component.topicPicker.notFound")}</CommandEmpty>
            <CommandGroup>
              {data?.topic?.map(({ id }) => (
                <CommandItem
                  key={id}
                  onSelect={(topicId) => {
                    onSelect(topicId);
                    setOpen(false);
                  }}
                >
                  {id}
                </CommandItem>
              ))}
              {isPending && (
                <CommandItem className="flex justify-center py-2" disabled>
                  <div className="i-lucide:loader-2 animate-spin" />
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
