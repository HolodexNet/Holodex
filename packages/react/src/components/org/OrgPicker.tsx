import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { useOrgs } from "@/services/orgs.service";
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
import { currentOrgAtom } from "@/store/org";
import { useAtom } from "jotai/react";

export function OrgSelectorCombobox() {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [currentOrg, setCurrentOrg] = useAtom(currentOrgAtom);
  // const [currentOrg, setOrg] = useAtom(orgAtom)

  // Use the useOrgs API service to fetch organizations
  const { data: orgs, isError } = useOrgs();

  if (isError) {
    return <div>Error fetching organizations</div>;
  }

  // If orgs is undefined or empty, show a loading state or empty state
  if (!orgs || orgs.length === 0) {
    return <div>Loading organizations...</div>;
  }

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
          {orgs.find((org) => org.name === currentOrg.name)?.name ||
            t("Select organization...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[80vw] p-0">
        <Command>
          <CommandInput placeholder={t("Search organization...")} />
          <CommandList>
            <CommandEmpty>{t("No organization found.")}</CommandEmpty>
            <CommandGroup>
              {orgs.map((org) => (
                <CommandItem
                  key={org.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setCurrentOrg(org);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === org.name ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
