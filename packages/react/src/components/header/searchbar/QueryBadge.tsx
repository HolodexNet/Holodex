import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/shadcn/ui/badge";
import { QueryItem } from "./types";
import { PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { splitQueryAtom } from "./SearchBarAtoms";

export function QueryBadge({ item }: { item: PrimitiveAtom<QueryItem> }) {
  const queryItem = useAtomValue(item);
  const querySplitItemAction = useSetAtom(splitQueryAtom);
  return (
    <Badge key={queryItem.value} variant="primary">
      {queryItem.text}
      <button
        className="ring-offset-base-2 focus:ring-primary-9 ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            querySplitItemAction({ type: "remove", atom: item });
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={() => querySplitItemAction({ type: "remove", atom: item })}
      >
        <X className="text-base-8 hover:text-base-11 h-3 w-3" />
      </button>
    </Badge>
  );
}
