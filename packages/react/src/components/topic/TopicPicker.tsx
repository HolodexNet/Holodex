import { useState, useEffect } from "react";
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
import { useTopics } from "@/services/topics.service";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { Drawer, DrawerContent, DrawerTrigger } from "@/shadcn/ui/drawer";

const { debouncedValueAtom, currentValueAtom } = atomWithDebounce("", 300);

interface TopicPickerProps {
  value?: string;
  onSelect: (topicId: string) => void;
  buttonClass?: string;
}

export function TopicPicker({
  value,
  onSelect,
  buttonClass,
}: TopicPickerProps) {
  const [debouncedValue, setDebouncedValue] = useAtom(debouncedValueAtom);
  const currentValue = useAtomValue(currentValueAtom);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data, isPending, mutate } = useSearchAutoCompleteMutation();
  const { data: topicList, isLoading } = useTopics();

  const isSmall = useAtomValue(siteIsSmallAtom);

  console.log(topicList);
  useEffect(() => {
    if (debouncedValue)
      mutate({
        q: debouncedValue,
        t: "topic",
        n: 10,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  if (isSmall) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            size="lg"
            aria-expanded={open}
            className={
              "max-w-xs justify-between border-base px-4" + buttonClass
            }
          >
            {value ?? t("component.topicPicker.pickLabel")}
            <div className="i-heroicons:chevron-up-down ml-2 h-4 w-4 shrink-0 opacity-50 " />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-0">
          <Command>
            <CommandInput
              value={currentValue}
              onValueChange={setDebouncedValue}
              placeholder={t("component.topicPicker.searchLabel")}
            />
            <CommandList>
              <CommandEmpty>{t("component.topicPicker.notFound")}</CommandEmpty>
              <CommandGroup>
                {((debouncedValue && data?.topic) || topicList || []).map(
                  ({ id }) => (
                    <CommandItem
                      key={id}
                      onSelect={(topicId) => {
                        onSelect(topicId);
                        setOpen(false);
                      }}
                    >
                      {id}
                    </CommandItem>
                  ),
                )}
                {(isPending || isLoading) && (
                  <CommandItem className="flex justify-center py-2" disabled>
                    <div className="i-lucide:loader-2 animate-spin" />
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          className={"max-w-xs justify-between border-base px-4 " + buttonClass}
        >
          {value ?? t("component.topicPicker.pickLabel")}
          <div className="i-heroicons:chevron-up-down ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            value={currentValue}
            onValueChange={setDebouncedValue}
            placeholder={t("component.topicPicker.searchLabel")}
          />
          <CommandList>
            <CommandEmpty>{t("component.topicPicker.notFound")}</CommandEmpty>
            <CommandGroup>
              {((debouncedValue && data?.topic) || topicList || []).map(
                ({ id }) => (
                  <CommandItem
                    key={id}
                    onSelect={(topicId) => {
                      onSelect(topicId);
                      setOpen(false);
                    }}
                  >
                    {id}
                  </CommandItem>
                ),
              )}
              {(isPending || isLoading) && (
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
