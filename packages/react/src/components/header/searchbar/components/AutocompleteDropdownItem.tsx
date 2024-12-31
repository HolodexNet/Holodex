import { Command as CommandPrimitive } from "cmdk";
import { CommandItem } from "@/shadcn/ui/command";
import { QueryItem } from "../types";
import { useTranslation } from "react-i18next";

interface AutocompleteDropdownItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  item: QueryItem;
  onSelect: (_: string) => void;
}
export function AutocompleteDropdownItem({
  item,
  onSelect,
  ...rest
}: AutocompleteDropdownItemProps) {
  const { t } = useTranslation();

  return (
    <CommandItem
      key={item.type + item.value}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      value={item.type + item.value}
      onSelect={onSelect}
      className={"cursor-pointer"}
      {...rest}
    >
      <span className="mr-1 font-medium text-base-11">
        {t(`search.class.${item.type}`, item.type)}
        {":"}
      </span>
      {item.incomplete ? (
        <span className="font-normal text-base-9">
          {t(`search.class_explanation.${item.type}`, " ")}
        </span>
      ) : (
        <span className="text-base-11">
          {item.text === "$t"
            ? t(`search.class_values.${item.type}.${item.value}`, " ")
            : item.text === "?"
              ? item.value
              : item.text}
        </span>
      )}
    </CommandItem>
  );
}
