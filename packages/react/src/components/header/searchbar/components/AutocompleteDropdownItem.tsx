import { Command as CommandPrimitive } from "cmdk";
import { CommandItem } from "@/shadcn/ui/command";
import { QueryItem } from "../types";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";

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
  const categoryName = useCallback(
    (query: QueryItem) => {
      return t(`search.class.${query.type}`, query.type);
    },
    [t],
  );

  const categoryExplanation = useCallback(
    (query: QueryItem) => {
      return t(`search.class_explanation.${query.type}`, " ");
    },
    [t],
  );

  const categoryValue = useCallback(
    (query: QueryItem) => {
      return query.text === "$t"
        ? t(`search.class_values.${query.type}.${query.value}`, " ")
        : query.text === "?"
          ? query.value
          : query.text;
    },
    [t],
  );

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
      <span className="font-medium text-base-11">
        {categoryName(item)}:&nbsp;
      </span>
      {item.incomplete ? (
        <span className="font-normal text-base-9">
          {categoryExplanation(item)}
        </span>
      ) : (
        <span className="text-base-11">{categoryValue(item)}</span>
      )}
    </CommandItem>
  );
}
